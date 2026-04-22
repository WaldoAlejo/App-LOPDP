import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { ChangeStatusDto } from './dto/change-status.dto';

const VALID_STATUSES = [
  'borrador', 'en_edicion', 'enviado', 'en_revision_dpo',
  'observado', 'en_correccion', 'subsanado', 'validado',
  'aprobado', 'requiere_eipd', 'archivado', 'reemplazado'
];

const STATUS_FLOW: Record<string, string[]> = {
  borrador: ['en_edicion', 'enviado'],
  en_edicion: ['borrador', 'enviado'],
  enviado: ['en_revision_dpo', 'observado', 'aprobado', 'requiere_eipd'],
  en_revision_dpo: ['observado', 'validado', 'aprobado', 'requiere_eipd'],
  observado: ['en_correccion'],
  en_correccion: ['subsanado'],
  subsanado: ['en_revision_dpo', 'observado', 'en_correccion', 'aprobado', 'requiere_eipd'],
  validado: ['aprobado', 'observado'],
  aprobado: ['archivado'],
  requiere_eipd: ['en_revision_dpo', 'aprobado'],
  archivado: [],
  reemplazado: [],
};

const COMPANY_WIDE_TREATMENT_ROLES = new Set(['DPO', 'SECURITY_LEAD', 'AUDITOR']);
const REVIEW_AUTHORITY_ROLES = new Set(['SUPER_ADMIN', 'DPO']);
const OPERATIONAL_TREATMENT_ROLES = new Set(['SUPER_ADMIN', 'COMPANY_ADMIN', 'PROCESS_LEADER', 'SUPPORT', 'AUDITOR', 'SECURITY_LEAD']);

@Injectable()
export class TreatmentsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  private normalizeCodeToken(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .toUpperCase();
  }

  private getInitials(value: string): string {
    const normalized = this.normalizeCodeToken(value);
    const words = normalized.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return 'XX';
    if (words.length === 1) {
      const w = words[0];
      return w.length >= 2 ? w.slice(0, 2) : w.padEnd(2, 'X');
    }
    // Para nombres compuestos, tomar la primera letra de cada palabra (hasta 4 letras)
    const initials = words.map(w => w[0]).join('');
    return initials.slice(0, 4).padEnd(2, 'X');
  }

  private buildCodeSegment(value: string) {
    return this.getInitials(value);
  }

  private extractCodeSequence(code: string, prefix: string) {
    const match = code.match(new RegExp(`^${prefix}-(\\d+)$`));
    if (!match) {
      return 0;
    }

    return Number.parseInt(match[1], 10) || 0;
  }

  private async resolveCodeContext(companyId: string, areaId: string, processId: string) {
    const [area, process] = await Promise.all([
      this.prisma.area.findUnique({
        where: { id: areaId },
        select: { id: true, companyId: true, name: true },
      }),
      this.prisma.process.findUnique({
        where: { id: processId },
        select: { id: true, companyId: true, areaId: true, name: true },
      }),
    ]);

    if (!area || area.companyId !== companyId) {
      throw new BadRequestException('El área seleccionada no es válida para la empresa del tratamiento');
    }

    if (!process || process.companyId !== companyId || process.areaId !== areaId) {
      throw new BadRequestException('El proceso seleccionado no es válido para el área indicada');
    }

    const areaSegment = this.buildCodeSegment(area.name);
    const processSegment = this.buildCodeSegment(process.name);
    const prefix = `RAT-${areaSegment}-${processSegment}`;

    return { areaSegment, processSegment, prefix };
  }

  private async generateTreatmentCode(
    companyId: string,
    areaId: string,
    processId: string,
    currentTreatment?: { id: string; areaId: string; processId: string; code: string },
  ) {
    const context = await this.resolveCodeContext(companyId, areaId, processId);

    if (
      currentTreatment
      && currentTreatment.areaId === areaId
      && currentTreatment.processId === processId
      && currentTreatment.code.startsWith(`${context.prefix}-`)
    ) {
      return {
        code: currentTreatment.code,
        areaSegment: context.areaSegment,
        processSegment: context.processSegment,
        sequence: this.extractCodeSequence(currentTreatment.code, context.prefix),
      };
    }

    const treatmentsWithPrefix = await this.prisma.treatment.findMany({
      where: {
        companyId,
        code: { startsWith: `${context.prefix}-` },
        ...(currentTreatment ? { NOT: { id: currentTreatment.id } } : {}),
      },
      select: { code: true },
    });

    const nextSequence = treatmentsWithPrefix.reduce((maxSequence, treatment) => {
      return Math.max(maxSequence, this.extractCodeSequence(treatment.code, context.prefix));
    }, 0) + 1;

    return {
      code: `${context.prefix}-${String(nextSequence).padStart(3, '0')}`,
      areaSegment: context.areaSegment,
      processSegment: context.processSegment,
      sequence: nextSequence,
    };
  }

  private buildAccessWhere(currentUser: any) {
    if (currentUser.roleCode === 'SUPER_ADMIN') {
      return {};
    }

    if (COMPANY_WIDE_TREATMENT_ROLES.has(currentUser.roleCode)) {
      return { companyId: currentUser.companyId };
    }

    return {
      companyId: currentUser.companyId,
      OR: [
        { createdByUserId: currentUser.userId },
        { treatmentResponsibleUserId: currentUser.userId },
        { process: { responsibleUserId: currentUser.userId } },
      ],
    };
  }

  private assertAccessToTreatment(treatment: any, currentUser: any) {
    if (currentUser.roleCode === 'SUPER_ADMIN') {
      return;
    }

    if (treatment.companyId !== currentUser.companyId) {
      throw new ForbiddenException('No tienes permiso para ver este tratamiento');
    }

    if (COMPANY_WIDE_TREATMENT_ROLES.has(currentUser.roleCode)) {
      return;
    }

    const hasScopedAccess = treatment.createdByUserId === currentUser.userId
      || treatment.treatmentResponsibleUserId === currentUser.userId
      || treatment.process?.responsibleUserId === currentUser.userId;

    if (!hasScopedAccess) {
      throw new ForbiddenException('No tienes permiso para ver este tratamiento');
    }
  }

  private assertStatusChangePermission(treatment: any, newStatus: string, currentUser: any) {
    if (currentUser.roleCode === 'SUPER_ADMIN') {
      return;
    }

    const reviewStatuses = new Set(['en_revision_dpo', 'observado', 'validado', 'aprobado', 'requiere_eipd']);

    if (reviewStatuses.has(newStatus)) {
      if (!REVIEW_AUTHORITY_ROLES.has(currentUser.roleCode)) {
        throw new ForbiddenException('Solo el DPO puede ejecutar acciones de revisión sobre el tratamiento');
      }
      return;
    }

    if (newStatus === 'en_correccion' && treatment.currentStatus === 'subsanado') {
      if (!REVIEW_AUTHORITY_ROLES.has(currentUser.roleCode)) {
        throw new ForbiddenException('Solo el DPO puede devolver una subsanación a corrección');
      }
      return;
    }

    if (!OPERATIONAL_TREATMENT_ROLES.has(currentUser.roleCode) && !REVIEW_AUTHORITY_ROLES.has(currentUser.roleCode)) {
      throw new ForbiddenException('Tu rol no puede cambiar el estado de este tratamiento');
    }
  }

  private assertAutomatedProcessingCompleteness(data: {
    profiling?: boolean | null;
    profilingDescription?: string | null;
    automatedDecisions?: boolean | null;
    automatedDecisionsDescription?: string | null;
    automatedDecisionsLogic?: string | null;
    automatedDecisionsConsequences?: string | null;
    humanInterventionAvailable?: boolean | null;
    usesAi?: boolean | null;
    aiSystemDescription?: string | null;
  }) {
    if (data.profiling && !data.profilingDescription?.trim()) {
      throw new BadRequestException('Si el tratamiento incluye perfilamiento, debe documentar su finalidad y consecuencias');
    }

    if (data.automatedDecisions) {
      if (!data.automatedDecisionsDescription?.trim()) {
        throw new BadRequestException('Si el tratamiento incluye decisiones automatizadas, debe documentar su descripción general');
      }
      if (!data.automatedDecisionsLogic?.trim()) {
        throw new BadRequestException('Si el tratamiento incluye decisiones automatizadas, debe documentar la lógica o criterios del sistema');
      }
      if (!data.automatedDecisionsConsequences?.trim()) {
        throw new BadRequestException('Si el tratamiento incluye decisiones automatizadas, debe documentar sus consecuencias para el titular');
      }
      if (!data.humanInterventionAvailable) {
        throw new BadRequestException('Si el tratamiento incluye decisiones automatizadas, debe registrar la disponibilidad de intervención humana');
      }
    }

    if (data.usesAi && !data.aiSystemDescription?.trim()) {
      throw new BadRequestException('Si el tratamiento usa sistemas de IA, debe documentar su funcionamiento y medidas de mitigación');
    }
  }

  private assertCrossPhaseConsistency(data: {
    internationalTransfer?: boolean | null;
    thirdParties?: Array<{ transferOutsideCountry?: boolean | null }>;
    internationalTransfers?: Array<{
      countryId?: string | null;
      thirdPartyId?: string | null;
      destinationName?: string | null;
      transferredDataDescription?: string | null;
      purpose?: string | null;
      safeguards?: string | null;
    }>;
    medium?: string | null;
    technologies?: string | null;
    linkedDocuments?: string | null;
    lifecycle?: Array<{
      lifecyclePhaseId?: string | null;
      mediumOrSupport?: string | null;
      technologies?: string | null;
      linkedDocuments?: string | null;
      activityDescription?: string | null;
    }>;
  }) {
    const hasInternationalTransferFlag = !!data.internationalTransfer;
    const hasThirdPartyOutsideCountry = (data.thirdParties || []).some((item) => !!item.transferOutsideCountry);
    const internationalTransfers = data.internationalTransfers || [];

    if ((hasInternationalTransferFlag || hasThirdPartyOutsideCountry) && internationalTransfers.length === 0) {
      throw new BadRequestException('Debe registrar transferencias internacionales cuando el tratamiento las declara o un tercero transfiere datos fuera del país');
    }

    if (internationalTransfers.length > 0 && !hasInternationalTransferFlag) {
      throw new BadRequestException('Si registra transferencias internacionales, debe marcar el tratamiento con transferencia internacional');
    }

    const lifecycle = data.lifecycle || [];
    const uniquePhaseIds = new Set<string>();
    for (const phase of lifecycle) {
      if (!phase.lifecyclePhaseId) {
        continue;
      }
      if (uniquePhaseIds.has(phase.lifecyclePhaseId)) {
        throw new BadRequestException('No se puede repetir la misma fase del ciclo de vida dentro de un tratamiento');
      }
      uniquePhaseIds.add(phase.lifecyclePhaseId);
    }

    const hasGeneralMedium = !!data.medium?.trim();
    const hasGeneralTechnologies = !!data.technologies?.trim();
    const hasGeneralLinkedDocuments = !!data.linkedDocuments?.trim();
    const hasLifecycleMedium = lifecycle.some((item) => !!item.mediumOrSupport?.trim());
    const hasLifecycleTechnologies = lifecycle.some((item) => !!item.technologies?.trim());
    const hasLifecycleLinkedDocuments = lifecycle.some((item) => !!item.linkedDocuments?.trim());

    if (lifecycle.length > 0 && hasGeneralMedium && !hasLifecycleMedium) {
      throw new BadRequestException('Si registra un soporte general en tecnologías y soportes, al menos una fase del ciclo de vida debe reflejarlo');
    }

    if (lifecycle.length > 0 && hasGeneralTechnologies && !hasLifecycleTechnologies) {
      throw new BadRequestException('Si registra tecnologías generales en el paso 6, al menos una fase del ciclo de vida debe reflejarlas');
    }

    if (lifecycle.length > 0 && hasGeneralLinkedDocuments && !hasLifecycleLinkedDocuments) {
      throw new BadRequestException('Si registra documentos vinculados en el paso 6, al menos una fase del ciclo de vida debe referenciarlos');
    }

    if (hasLifecycleMedium && !hasGeneralMedium) {
      throw new BadRequestException('Si detalla soportes por fase, debe registrar también un soporte general en tecnologías y soportes');
    }

    if (hasLifecycleTechnologies && !hasGeneralTechnologies) {
      throw new BadRequestException('Si detalla tecnologías por fase, debe registrar también tecnologías generales en el paso 6');
    }

    if (hasLifecycleLinkedDocuments && !hasGeneralLinkedDocuments) {
      throw new BadRequestException('Si detalla documentos por fase, debe registrar también documentos vinculados en el paso 6');
    }
  }

  async findAll(currentUser: any, query: { companyId?: string; areaId?: string; status?: string; search?: string }) {
    if (!currentUser.companyId && currentUser.roleCode !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Tu usuario no está asociado a ninguna empresa. Contacta al administrador.');
    }

    const where: any = this.buildAccessWhere(currentUser);

    if (currentUser.roleCode === 'SUPER_ADMIN' && query.companyId) {
      where.companyId = query.companyId;
    }

    if (query.areaId) where.areaId = query.areaId;
    if (query.status) {
      const statuses = query.status.split(',').map(s => s.trim()).filter(Boolean);
      where.currentStatus = statuses.length > 1 ? { in: statuses } : statuses[0];
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { mainPurpose: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.treatment.findMany({
      where,
      include: {
        company: true,
        dataSubjects: true,
        riskAssessment: true,
        observations: { where: { status: 'abierta' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, currentUser: any) {
    if (!currentUser.companyId && currentUser.roleCode !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Tu usuario no está asociado a ninguna empresa. Contacta al administrador.');
    }

    const treatment = await this.prisma.treatment.findUnique({
      where: { id },
      include: {
        company: true,
        process: {
          select: {
            id: true,
            name: true,
            responsibleUserId: true,
          },
        },
        dataSubjects: true,
        treatmentDataItems: true,
        treatmentLegalBases: true,
        treatmentThirdParties: true,
        internationalTransfers: true,
        treatmentRetention: true,
        treatmentSecurityMeasures: true,
        lifecyclePhases: true,
        riskAssessment: true,
        observations: { orderBy: { createdAt: 'desc' } },
        versions: { orderBy: { createdAt: 'desc' } },
        statusHistory: { orderBy: { changedAt: 'desc' } },
      },
    });
    if (!treatment) throw new NotFoundException('Tratamiento no encontrado');
    this.assertAccessToTreatment(treatment, currentUser);
    return treatment;
  }

  async getCodePreview(currentUser: any, params: { areaId?: string; processId?: string; treatmentId?: string }) {
    if (!params.areaId || !params.processId) {
      throw new BadRequestException('Debe seleccionar área y proceso para generar el código RAT');
    }

    let companyId = currentUser.companyId;
    let currentTreatment: { id: string; areaId: string; processId: string; code: string } | undefined;

    if (params.treatmentId) {
      const treatment = await this.prisma.treatment.findUnique({
        where: { id: params.treatmentId },
        select: {
          id: true,
          companyId: true,
          areaId: true,
          processId: true,
          code: true,
          createdByUserId: true,
          treatmentResponsibleUserId: true,
          process: { select: { responsibleUserId: true } },
        },
      });

      if (!treatment) {
        throw new NotFoundException('Tratamiento no encontrado');
      }

      this.assertAccessToTreatment(treatment, currentUser);
      companyId = treatment.companyId;
      currentTreatment = {
        id: treatment.id,
        areaId: treatment.areaId,
        processId: treatment.processId,
        code: treatment.code,
      };
    }

    return this.generateTreatmentCode(companyId, params.areaId, params.processId, currentTreatment);
  }

  async create(dto: CreateTreatmentDto, currentUser: any) {
    if (!currentUser.companyId && currentUser.roleCode !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Tu usuario no está asociado a ninguna empresa. Contacta al administrador.');
    }

    if (currentUser.roleCode !== 'SUPER_ADMIN') {
      dto.companyId = currentUser.companyId;
    }

    const generatedCode = await this.generateTreatmentCode(dto.companyId, dto.areaId, dto.processId);

    const {
      code: _ignoredCode,
      dataSubjects = [],
      dataItems = [],
      legalBases = [],
      retention,
      securityMeasures = [],
      thirdParties = [],
      internationalTransfers = [],
      lifecycle = [],
      riskAssessment,
      ...treatmentData
    } = dto;

    this.assertCrossPhaseConsistency({
      internationalTransfer: treatmentData.internationalTransfer,
      thirdParties,
      internationalTransfers,
      medium: treatmentData.medium,
      technologies: treatmentData.technologies,
      linkedDocuments: treatmentData.linkedDocuments,
      lifecycle,
    });
    this.assertAutomatedProcessingCompleteness(treatmentData);

    const treatment = await this.prisma.treatment.create({
      data: {
        ...treatmentData,
        code: generatedCode.code,
        createdByUserId: currentUser.userId,
        currentStatus: 'borrador',
        dataSubjects: dataSubjects.length
          ? {
              create: dataSubjects.map((item) => ({
                dataSubjectTypeId: item.dataSubjectTypeId,
                approximateCount: item.approximateCount,
                sourceType: item.sourceType,
                relationshipWithCompany: item.relationshipWithCompany,
                notes: item.notes,
              })),
            }
          : undefined,
        treatmentDataItems: dataItems.length
          ? {
              create: dataItems.map((item) => ({
                dataItemId: item.dataItemId,
                isRequired: item.isRequired,
                isOptional: item.isOptional,
                sourceDirectOrIndirect: item.sourceDirectOrIndirect,
                notes: item.notes,
              })),
            }
          : undefined,
        treatmentLegalBases: legalBases.length
          ? {
              create: legalBases.map((item) => ({
                legalBasisId: item.legalBasisId,
                justification: item.justification,
                isMainBasis: item.isMainBasis,
              })),
            }
          : undefined,
        treatmentRetention: retention
          ? {
              create: {
                retentionRuleId: retention.retentionRuleId,
                activeRetentionPeriod: retention.activeRetentionPeriod,
                retentionCriteria: retention.retentionCriteria,
                legalOrContractualBasis: retention.legalOrContractualBasis,
                blockingApplies: retention.blockingApplies,
                anonymizationApplies: retention.anonymizationApplies,
                deletionApplies: retention.deletionApplies,
                deletionMethod: retention.deletionMethod,
                reviewFrequency: retention.reviewFrequency,
                responsibleRole: retention.responsibleRole,
                notes: retention.notes,
              },
            }
          : undefined,
        treatmentSecurityMeasures: securityMeasures.length
          ? {
              create: securityMeasures.map((item) => ({
                securityMeasureId: item.securityMeasureId,
                implemented: item.implemented,
                evidence: item.evidence,
                criticality: item.criticality,
                notes: item.notes,
              })),
            }
          : undefined,
        treatmentThirdParties: thirdParties.length
          ? {
              create: thirdParties.map((item) => ({
                thirdPartyId: item.thirdPartyId,
                accessPurpose: item.accessPurpose,
                accessedDataDescription: item.accessedDataDescription,
                involvedDataSubjects: item.involvedDataSubjects,
                transferOutsideCountry: item.transferOutsideCountry,
                notes: item.notes,
              })),
            }
          : undefined,
        internationalTransfers: internationalTransfers.length
          ? {
              create: internationalTransfers.map((item) => ({
                countryId: item.countryId,
                thirdPartyId: item.thirdPartyId,
                destinationName: item.destinationName,
                transferredDataDescription: item.transferredDataDescription,
                purpose: item.purpose,
                transferLegalBasis: item.transferLegalBasis,
                safeguards: item.safeguards,
                notes: item.notes,
              })),
            }
          : undefined,
        lifecyclePhases: lifecycle.length
          ? {
              create: lifecycle.map((item, index) => ({
                lifecyclePhaseId: item.lifecyclePhaseId,
                activityDescription: item.activityDescription,
                processedDataDescription: item.processedDataDescription,
                participants: item.participants,
                mediumOrSupport: item.mediumOrSupport,
                technologies: item.technologies,
                linkedDocuments: item.linkedDocuments,
                securityMeasuresByPhase: item.securityMeasuresByPhase,
                risksByPhase: item.risksByPhase,
                phaseOrder: index + 1,
              })),
            }
          : undefined,
        riskAssessment: riskAssessment
          ? {
              create: {
                usesSpecialCategories: riskAssessment.usesSpecialCategories,
                involvesChildren: riskAssessment.involvesChildren,
                largeScale: riskAssessment.largeScale,
                systematicMonitoring: riskAssessment.systematicMonitoring,
                profiling: riskAssessment.profiling,
                automatedDecisions: riskAssessment.automatedDecisions,
                videoSurveillance: riskAssessment.videoSurveillance,
                geolocation: riskAssessment.geolocation,
                biometricData: riskAssessment.biometricData,
                healthData: riskAssessment.healthData,
                criminalData: riskAssessment.criminalData,
                crossBorderTransfer: riskAssessment.crossBorderTransfer,
                potentialHighImpact: riskAssessment.potentialHighImpact,
              },
            }
          : undefined,
      },
      include: {
        dataSubjects: true,
        treatmentDataItems: true,
        treatmentLegalBases: true,
        treatmentRetention: true,
        treatmentSecurityMeasures: true,
        treatmentThirdParties: true,
        internationalTransfers: true,
        lifecyclePhases: true,
        riskAssessment: true,
      },
    });

    await this.prisma.statusHistory.create({
      data: {
        treatmentId: treatment.id,
        previousStatus: '-',
        newStatus: 'borrador',
        changedByUserId: currentUser.userId,
        comment: 'Tratamiento creado',
      },
    });

    await this.audit.log({
      userId: currentUser.userId,
      companyId: treatment.companyId,
      action: 'TREATMENT_CREATED',
      entityName: 'Treatment',
      entityId: treatment.id,
      newValuesJson: JSON.stringify({ ...dto, code: generatedCode.code }),
    });

    return treatment;
  }

  async update(id: string, dto: UpdateTreatmentDto, currentUser: any) {
    const treatment = await this.findOne(id, currentUser);
    if (!['borrador', 'en_edicion', 'observado', 'en_correccion'].includes(treatment.currentStatus)) {
      throw new BadRequestException('No se puede editar un tratamiento en el estado actual');
    }

    const {
      dataSubjects,
      dataItems,
      legalBases,
      retention,
      securityMeasures,
      thirdParties,
      internationalTransfers,
      lifecycle,
      riskAssessment,
      ...treatmentData
    } = dto;

    this.assertCrossPhaseConsistency({
      internationalTransfer: treatmentData.internationalTransfer ?? treatment.internationalTransfer,
      thirdParties: thirdParties ?? treatment.treatmentThirdParties,
      internationalTransfers: internationalTransfers ?? treatment.internationalTransfers,
      medium: treatmentData.medium ?? treatment.medium,
      technologies: treatmentData.technologies ?? treatment.technologies,
      linkedDocuments: treatmentData.linkedDocuments ?? treatment.linkedDocuments,
      lifecycle: lifecycle ?? treatment.lifecyclePhases,
    });
    this.assertAutomatedProcessingCompleteness({
      profiling: treatmentData.profiling ?? treatment.profiling,
      profilingDescription: treatmentData.profilingDescription ?? treatment.profilingDescription,
      automatedDecisions: treatmentData.automatedDecisions ?? treatment.automatedDecisions,
      automatedDecisionsDescription: treatmentData.automatedDecisionsDescription ?? treatment.automatedDecisionsDescription,
      automatedDecisionsLogic: treatmentData.automatedDecisionsLogic ?? treatment.automatedDecisionsLogic,
      automatedDecisionsConsequences: treatmentData.automatedDecisionsConsequences ?? treatment.automatedDecisionsConsequences,
      humanInterventionAvailable: treatmentData.humanInterventionAvailable ?? treatment.humanInterventionAvailable,
      usesAi: treatmentData.usesAi ?? treatment.usesAi,
      aiSystemDescription: treatmentData.aiSystemDescription ?? treatment.aiSystemDescription,
    });

    const nextCompanyId = currentUser.roleCode === 'SUPER_ADMIN'
      ? (dto.companyId ?? treatment.companyId)
      : currentUser.companyId;
    const nextAreaId = dto.areaId ?? treatment.areaId;
    const nextProcessId = dto.processId ?? treatment.processId;
    const generatedCode = await this.generateTreatmentCode(nextCompanyId, nextAreaId, nextProcessId, {
      id: treatment.id,
      areaId: treatment.areaId,
      processId: treatment.processId,
      code: treatment.code,
    });

    const updated = await this.prisma.treatment.update({
      where: { id },
      data: {
        ...treatmentData,
        companyId: nextCompanyId,
        code: generatedCode.code,
        dataSubjects:
          dataSubjects !== undefined
            ? {
                deleteMany: {},
                ...(dataSubjects.length
                  ? {
                      create: dataSubjects.map((item) => ({
                        dataSubjectTypeId: item.dataSubjectTypeId,
                        approximateCount: item.approximateCount,
                        sourceType: item.sourceType,
                        relationshipWithCompany: item.relationshipWithCompany,
                        notes: item.notes,
                      })),
                    }
                  : {}),
              }
            : undefined,
        treatmentDataItems:
          dataItems !== undefined
            ? {
                deleteMany: {},
                ...(dataItems.length
                  ? {
                      create: dataItems.map((item) => ({
                        dataItemId: item.dataItemId,
                        isRequired: item.isRequired,
                        isOptional: item.isOptional,
                        sourceDirectOrIndirect: item.sourceDirectOrIndirect,
                        notes: item.notes,
                      })),
                    }
                  : {}),
              }
            : undefined,
        treatmentLegalBases:
          legalBases !== undefined
            ? {
                deleteMany: {},
                ...(legalBases.length
                  ? {
                      create: legalBases.map((item) => ({
                        legalBasisId: item.legalBasisId,
                        justification: item.justification,
                        isMainBasis: item.isMainBasis,
                      })),
                    }
                  : {}),
              }
            : undefined,
        treatmentThirdParties:
          thirdParties !== undefined
            ? {
                deleteMany: {},
                ...(thirdParties.length
                  ? {
                      create: thirdParties.map((item) => ({
                        thirdPartyId: item.thirdPartyId,
                        accessPurpose: item.accessPurpose,
                        accessedDataDescription: item.accessedDataDescription,
                        involvedDataSubjects: item.involvedDataSubjects,
                        transferOutsideCountry: item.transferOutsideCountry,
                        notes: item.notes,
                      })),
                    }
                  : {}),
              }
            : undefined,
        internationalTransfers:
          internationalTransfers !== undefined
            ? {
                deleteMany: {},
                ...(internationalTransfers.length
                  ? {
                      create: internationalTransfers.map((item) => ({
                        countryId: item.countryId,
                        thirdPartyId: item.thirdPartyId,
                        destinationName: item.destinationName,
                        transferredDataDescription: item.transferredDataDescription,
                        purpose: item.purpose,
                        transferLegalBasis: item.transferLegalBasis,
                        safeguards: item.safeguards,
                        notes: item.notes,
                      })),
                    }
                  : {}),
              }
            : undefined,
        treatmentSecurityMeasures:
          securityMeasures !== undefined
            ? {
                deleteMany: {},
                ...(securityMeasures.length
                  ? {
                      create: securityMeasures.map((item) => ({
                        securityMeasureId: item.securityMeasureId,
                        implemented: item.implemented,
                        evidence: item.evidence,
                        criticality: item.criticality,
                        notes: item.notes,
                      })),
                    }
                  : {}),
              }
            : undefined,
        lifecyclePhases:
          lifecycle !== undefined
            ? {
                deleteMany: {},
                ...(lifecycle.length
                  ? {
                      create: lifecycle.map((item, index) => ({
                        lifecyclePhaseId: item.lifecyclePhaseId,
                        activityDescription: item.activityDescription,
                        processedDataDescription: item.processedDataDescription,
                        participants: item.participants,
                        mediumOrSupport: item.mediumOrSupport,
                        technologies: item.technologies,
                        linkedDocuments: item.linkedDocuments,
                        securityMeasuresByPhase: item.securityMeasuresByPhase,
                        risksByPhase: item.risksByPhase,
                        phaseOrder: index + 1,
                      })),
                    }
                  : {}),
              }
            : undefined,
        treatmentRetention:
          retention !== undefined
            ? {
                upsert: {
                  create: {
                    retentionRuleId: retention.retentionRuleId,
                    activeRetentionPeriod: retention.activeRetentionPeriod,
                    retentionCriteria: retention.retentionCriteria,
                    legalOrContractualBasis: retention.legalOrContractualBasis,
                    blockingApplies: retention.blockingApplies,
                    anonymizationApplies: retention.anonymizationApplies,
                    deletionApplies: retention.deletionApplies,
                    deletionMethod: retention.deletionMethod,
                    reviewFrequency: retention.reviewFrequency,
                    responsibleRole: retention.responsibleRole,
                    notes: retention.notes,
                  },
                  update: {
                    retentionRuleId: retention.retentionRuleId,
                    activeRetentionPeriod: retention.activeRetentionPeriod,
                    retentionCriteria: retention.retentionCriteria,
                    legalOrContractualBasis: retention.legalOrContractualBasis,
                    blockingApplies: retention.blockingApplies,
                    anonymizationApplies: retention.anonymizationApplies,
                    deletionApplies: retention.deletionApplies,
                    deletionMethod: retention.deletionMethod,
                    reviewFrequency: retention.reviewFrequency,
                    responsibleRole: retention.responsibleRole,
                    notes: retention.notes,
                  },
                },
              }
            : undefined,
        riskAssessment:
          riskAssessment !== undefined
            ? {
                upsert: {
                  create: {
                    usesSpecialCategories: riskAssessment.usesSpecialCategories,
                    involvesChildren: riskAssessment.involvesChildren,
                    largeScale: riskAssessment.largeScale,
                    systematicMonitoring: riskAssessment.systematicMonitoring,
                    profiling: riskAssessment.profiling,
                    automatedDecisions: riskAssessment.automatedDecisions,
                    videoSurveillance: riskAssessment.videoSurveillance,
                    geolocation: riskAssessment.geolocation,
                    biometricData: riskAssessment.biometricData,
                    healthData: riskAssessment.healthData,
                    criminalData: riskAssessment.criminalData,
                    crossBorderTransfer: riskAssessment.crossBorderTransfer,
                    potentialHighImpact: riskAssessment.potentialHighImpact,
                  },
                  update: {
                    usesSpecialCategories: riskAssessment.usesSpecialCategories,
                    involvesChildren: riskAssessment.involvesChildren,
                    largeScale: riskAssessment.largeScale,
                    systematicMonitoring: riskAssessment.systematicMonitoring,
                    profiling: riskAssessment.profiling,
                    automatedDecisions: riskAssessment.automatedDecisions,
                    videoSurveillance: riskAssessment.videoSurveillance,
                    geolocation: riskAssessment.geolocation,
                    biometricData: riskAssessment.biometricData,
                    healthData: riskAssessment.healthData,
                    criminalData: riskAssessment.criminalData,
                    crossBorderTransfer: riskAssessment.crossBorderTransfer,
                    potentialHighImpact: riskAssessment.potentialHighImpact,
                  },
                },
              }
            : undefined,
      },
      include: {
        dataSubjects: true,
        treatmentDataItems: true,
        treatmentLegalBases: true,
        treatmentThirdParties: true,
        internationalTransfers: true,
        treatmentRetention: true,
        treatmentSecurityMeasures: true,
        lifecyclePhases: true,
        riskAssessment: true,
      },
    });

    await this.audit.log({
      userId: currentUser.userId,
      companyId: treatment.companyId,
      action: 'TREATMENT_UPDATED',
      entityName: 'Treatment',
      entityId: id,
      oldValuesJson: JSON.stringify(treatment),
      newValuesJson: JSON.stringify({ ...dto, code: generatedCode.code, companyId: nextCompanyId }),
    });

    return updated;
  }

  async changeStatus(id: string, dto: ChangeStatusDto, currentUser: any) {
    const treatment = await this.findOne(id, currentUser);
    const newStatus = dto.status;

    if (!VALID_STATUSES.includes(newStatus)) {
      throw new BadRequestException('Estado no válido');
    }

    this.assertStatusChangePermission(treatment, newStatus, currentUser);

    const allowedTransitions = STATUS_FLOW[treatment.currentStatus] || [];
    if (!allowedTransitions.includes(newStatus) && currentUser.roleCode !== 'SUPER_ADMIN') {
      throw new BadRequestException(`No se puede cambiar de ${treatment.currentStatus} a ${newStatus}`);
    }

    const openObservations = ['observado', 'en_correccion', 'subsanado', 'validado', 'aprobado'].includes(newStatus)
      ? await this.prisma.observation.count({ where: { treatmentId: id, status: 'abierta' } })
      : 0;

    // Validaciones específicas por estado
    if (newStatus === 'observado' && openObservations === 0) {
      throw new BadRequestException('No se puede marcar como observado sin registrar observaciones abiertas');
    }

    if (newStatus === 'subsanado') {
      if (openObservations > 0) {
        throw new BadRequestException('No se puede reenviar una subsanación mientras existan observaciones abiertas');
      }

      const totalObservations = await this.prisma.observation.count({ where: { treatmentId: id } });
      if (totalObservations === 0) {
        throw new BadRequestException('No se puede marcar como subsanado un tratamiento que no haya sido observado');
      }
    }

    if (newStatus === 'en_correccion' && ['observado', 'subsanado'].includes(treatment.currentStatus) && openObservations === 0) {
      throw new BadRequestException('No se puede devolver a corrección sin observaciones abiertas');
    }

    if (['validado', 'aprobado'].includes(newStatus) && openObservations > 0) {
      throw new BadRequestException(`No se puede pasar a ${newStatus} con observaciones abiertas`);
    }

    if (newStatus === 'enviado') {
      await this.validateCompleteness(id);
    }

    const updated = await this.prisma.treatment.update({
      where: { id },
      data: {
        currentStatus: newStatus,
        submissionDate: newStatus === 'enviado' ? new Date() : treatment.submissionDate,
        approvalDate: newStatus === 'aprobado' ? new Date() : treatment.approvalDate,
        reviewedByUserId: ['en_revision_dpo', 'validado', 'aprobado', 'observado', 'en_correccion', 'requiere_eipd'].includes(newStatus)
          ? currentUser.userId
          : treatment.reviewedByUserId,
      },
    });

    await this.prisma.statusHistory.create({
      data: {
        treatmentId: id,
        previousStatus: treatment.currentStatus,
        newStatus,
        changedByUserId: currentUser.userId,
        comment: dto.comment || `Cambio de estado a ${newStatus}`,
      },
    });

    // Evaluación automática de riesgo al enviar o aprobar
    if (['enviado', 'aprobado'].includes(newStatus)) {
      await this.evaluateRisk(id);
    }

    await this.audit.log({
      userId: currentUser.userId,
      companyId: treatment.companyId,
      action: 'TREATMENT_STATUS_CHANGED',
      entityName: 'Treatment',
      entityId: id,
      oldValuesJson: JSON.stringify({ status: treatment.currentStatus }),
      newValuesJson: JSON.stringify({ status: newStatus, comment: dto.comment }),
    });

    return updated;
  }

  async delete(id: string, currentUser: any) {
    const treatment = await this.findOne(id, currentUser);
    if (treatment.currentStatus !== 'borrador') {
      throw new BadRequestException('Solo se pueden eliminar tratamientos en borrador');
    }
    await this.prisma.treatment.delete({ where: { id } });
    await this.audit.log({
      userId: currentUser.userId,
      companyId: treatment.companyId,
      action: 'TREATMENT_DELETED',
      entityName: 'Treatment',
      entityId: id,
      oldValuesJson: JSON.stringify(treatment),
    });
    return { message: 'Tratamiento eliminado' };
  }

  private async validateCompleteness(id: string) {
    const treatment = await this.prisma.treatment.findUnique({
      where: { id },
      include: {
        dataSubjects: true,
        treatmentDataItems: true,
        treatmentLegalBases: true,
        treatmentThirdParties: true,
        internationalTransfers: true,
        treatmentRetention: true,
        treatmentSecurityMeasures: true,
        lifecyclePhases: true,
      },
    });

    if (!treatment) throw new NotFoundException('Tratamiento no encontrado');

    const missing: string[] = [];
    if (!treatment.name) missing.push('nombre');
    if (!treatment.mainPurpose) missing.push('finalidad principal');
    if (treatment.dataSubjects.length === 0) missing.push('titulares');
    if (treatment.treatmentDataItems.length === 0) missing.push('datos tratados');
    if (treatment.treatmentLegalBases.length === 0) missing.push('base de legitimación');
    if (!treatment.treatmentRetention) missing.push('conservación');
    if (treatment.treatmentSecurityMeasures.length === 0) missing.push('medidas de seguridad');

    if (missing.length > 0) {
      throw new BadRequestException(`Faltan campos obligatorios: ${missing.join(', ')}`);
    }

    this.assertCrossPhaseConsistency({
      internationalTransfer: treatment.internationalTransfer,
      thirdParties: treatment.treatmentThirdParties,
      internationalTransfers: treatment.internationalTransfers,
      medium: treatment.medium,
      technologies: treatment.technologies,
      linkedDocuments: treatment.linkedDocuments,
      lifecycle: treatment.lifecyclePhases,
    });
    this.assertAutomatedProcessingCompleteness(treatment);
  }

  private async evaluateRisk(treatmentId: string) {
    const treatment = await this.prisma.treatment.findUnique({
      where: { id: treatmentId },
      include: {
        treatmentDataItems: { include: { dataItem: true } },
        riskAssessment: true,
      },
    });

    if (!treatment) return;

    let hasSpecialCategories = false;
    let hasBiometric = false;
    let hasHealth = false;
    let hasCriminal = false;

    for (const item of treatment.treatmentDataItems) {
      // Simplificado: en una implementación completa buscaríamos la categoría del dataItem
      if (item.dataItem?.isSensitive) hasSpecialCategories = true;
    }

    const ra = treatment.riskAssessment;
    const isHighRisk = !!ra && (
      ra.usesSpecialCategories ||
      ra.involvesChildren ||
      ra.biometricData ||
      ra.healthData ||
      ra.criminalData ||
      ra.automatedDecisions ||
      ra.systematicMonitoring ||
      ra.potentialHighImpact
    );

    const requiresDpia = !!ra && (
      (ra.usesSpecialCategories && ra.largeScale) ||
      ra.automatedDecisions ||
      ra.systematicMonitoring ||
      ra.potentialHighImpact
    );

    await this.prisma.treatment.update({
      where: { id: treatmentId },
      data: {
        highRiskFlag: isHighRisk,
        requiresDpia,
      },
    });

    if (ra) {
      await this.prisma.riskAssessment.update({
        where: { id: ra.id },
        data: {
          highRiskFlag: isHighRisk,
          requiresDpia,
        },
      });
    }
  }
}
