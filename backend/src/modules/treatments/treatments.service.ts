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
  enviado: ['en_revision_dpo', 'observado'],
  en_revision_dpo: ['observado', 'validado', 'requiere_eipd'],
  observado: ['en_correccion'],
  en_correccion: ['subsanado'],
  subsanado: ['en_revision_dpo', 'observado'],
  validado: ['aprobado', 'observado'],
  aprobado: ['archivado'],
  requiere_eipd: ['en_revision_dpo', 'aprobado'],
  archivado: [],
  reemplazado: [],
};

@Injectable()
export class TreatmentsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

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
    const where: any = {};

    if (currentUser.roleCode !== 'SUPER_ADMIN') {
      where.companyId = currentUser.companyId;
    } else if (query.companyId) {
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
    const treatment = await this.prisma.treatment.findUnique({
      where: { id },
      include: {
        company: true,
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
    if (currentUser.roleCode !== 'SUPER_ADMIN' && treatment.companyId !== currentUser.companyId) {
      throw new ForbiddenException('No tienes permiso para ver este tratamiento');
    }
    return treatment;
  }

  async create(dto: CreateTreatmentDto, currentUser: any) {
    if (currentUser.roleCode !== 'SUPER_ADMIN') {
      dto.companyId = currentUser.companyId;
    }

    const {
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
      newValuesJson: JSON.stringify(dto),
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

    const updated = await this.prisma.treatment.update({
      where: { id },
      data: {
        ...treatmentData,
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
      newValuesJson: JSON.stringify(dto),
    });

    return updated;
  }

  async changeStatus(id: string, dto: ChangeStatusDto, currentUser: any) {
    const treatment = await this.findOne(id, currentUser);
    const newStatus = dto.status;

    if (!VALID_STATUSES.includes(newStatus)) {
      throw new BadRequestException('Estado no válido');
    }

    const allowedTransitions = STATUS_FLOW[treatment.currentStatus] || [];
    if (!allowedTransitions.includes(newStatus) && currentUser.roleCode !== 'SUPER_ADMIN') {
      throw new BadRequestException(`No se puede cambiar de ${treatment.currentStatus} a ${newStatus}`);
    }

    const openObservations = ['observado', 'subsanado', 'validado', 'aprobado'].includes(newStatus)
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
        reviewedByUserId: ['en_revision_dpo', 'validado', 'aprobado', 'observado'].includes(newStatus)
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
