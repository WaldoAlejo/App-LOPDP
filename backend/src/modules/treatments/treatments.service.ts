import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notifications/notification.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CurrentUser, TreatmentStatus, TreatmentStatusType, createPaginatedResult, PaginatedResult } from '../../common';
import {
  TreatmentCodeService,
  TreatmentValidationService,
  TreatmentStateMachineService,
  TreatmentRiskService,
  TreatmentAccessService,
  TreatmentCompletenessService,
} from './services';

@Injectable()
export class TreatmentsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private notificationService: NotificationService,
    private codeService: TreatmentCodeService,
    private validationService: TreatmentValidationService,
    private stateMachine: TreatmentStateMachineService,
    private riskService: TreatmentRiskService,
    private accessService: TreatmentAccessService,
    private completenessService: TreatmentCompletenessService,
  ) {}

  // ═══════════════════════════════════════════════════════════════
  // QUERIES
  // ═══════════════════════════════════════════════════════════════

  async findAll(
    currentUser: CurrentUser,
    query: {
      companyId?: string;
      areaId?: string;
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<PaginatedResult<unknown>> {
    this.accessService.assertUserHasCompany(currentUser);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = this.buildListWhere(currentUser, query);

    const [data, total] = await Promise.all([
      this.prisma.treatment.findMany({
        where,
        include: {
          company: { select: { id: true, legalName: true } },
          dataSubjects: true,
          riskAssessment: true,
          observations: { where: { status: 'abierta' } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.treatment.count({ where }),
    ]);

    return createPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string, currentUser: CurrentUser) {
    this.accessService.assertUserHasCompany(currentUser);

    const treatment = await this.prisma.treatment.findUnique({
      where: { id },
      include: {
        company: true,
        process: { select: { id: true, name: true, responsibleUserId: true } },
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
    this.accessService.assertAccessToTreatment(treatment, currentUser);
    return treatment;
  }

  async getCodePreview(
    currentUser: CurrentUser,
    params: { areaId?: string; processId?: string; treatmentId?: string },
  ) {
    if (!params.areaId || !params.processId) {
      throw new BadRequestException('Debe seleccionar área y proceso para generar el código RAT');
    }

    let companyId = currentUser.companyId;
    let currentTreatment: { id: string; areaId: string; processId: string; code: string } | undefined;

    if (params.treatmentId) {
      const treatment = await this.prisma.treatment.findUnique({
        where: { id: params.treatmentId },
        select: {
          id: true, companyId: true, areaId: true, processId: true, code: true,
          createdByUserId: true, treatmentResponsibleUserId: true,
          process: { select: { responsibleUserId: true } },
        },
      });

      if (!treatment) throw new NotFoundException('Tratamiento no encontrado');
      this.accessService.assertAccessToTreatment(treatment, currentUser);
      companyId = treatment.companyId;
      currentTreatment = {
        id: treatment.id,
        areaId: treatment.areaId,
        processId: treatment.processId,
        code: treatment.code,
      };
    }

    return this.codeService.generateCode(companyId!, params.areaId!, params.processId!, currentTreatment);
  }

  // ═══════════════════════════════════════════════════════════════
  // COMMANDS
  // ═══════════════════════════════════════════════════════════════

  async create(dto: CreateTreatmentDto, currentUser: CurrentUser) {
    this.accessService.assertUserHasCompany(currentUser);

    if (currentUser.roleCode !== 'SUPER_ADMIN') {
      (dto as unknown as Record<string, unknown>).companyId = currentUser.companyId;
    }

    const generatedCode = await this.codeService.generateCode(
      dto.companyId!, dto.areaId, dto.processId,
    );

    const { code: _ignoredCode, ...nestedData } = dto as unknown as Record<string, unknown>;
    this.validateCreateUpdate(nestedData);

    const treatment = await this.prisma.treatment.create({
      data: {
        ...this.buildTreatmentData(nestedData),
        code: generatedCode.code,
        createdByUserId: currentUser.userId,
        currentStatus: TreatmentStatus.BORRADOR,
        ...this.buildNestedCreateInput(nestedData),
      },
      include: { dataSubjects: true, treatmentDataItems: true, treatmentLegalBases: true,
        treatmentRetention: true, treatmentSecurityMeasures: true, treatmentThirdParties: true,
        internationalTransfers: true, lifecyclePhases: true, riskAssessment: true },
    });

    await this.createStatusHistory(treatment.id, '-', TreatmentStatus.BORRADOR, currentUser.userId, 'Tratamiento creado');
    await this.audit.log({
      userId: currentUser.userId, companyId: treatment.companyId,
      action: 'TREATMENT_CREATED', entityName: 'Treatment', entityId: treatment.id,
      newValuesJson: JSON.stringify({ ...dto, code: generatedCode.code }),
    });

    return treatment;
  }

  async update(id: string, dto: UpdateTreatmentDto, currentUser: CurrentUser) {
    const treatment = await this.findOne(id, currentUser);
    if (![TreatmentStatus.BORRADOR, TreatmentStatus.EN_EDICION, TreatmentStatus.OBSERVADO, TreatmentStatus.EN_CORRECCION].some(s => s === treatment.currentStatus)) {
      throw new BadRequestException('No se puede editar un tratamiento en el estado actual');
    }

    const nestedData = dto as unknown as Record<string, unknown>;
    this.validateCreateUpdate(nestedData, treatment);

    const nextCompanyId = currentUser.roleCode === 'SUPER_ADMIN'
      ? (dto.companyId ?? treatment.companyId)
      : currentUser.companyId;
    const nextAreaId = dto.areaId ?? treatment.areaId;
    const nextProcessId = dto.processId ?? treatment.processId;

    const generatedCode = await this.codeService.generateCode(nextCompanyId!, nextAreaId, nextProcessId, {
      id: treatment.id, areaId: treatment.areaId, processId: treatment.processId, code: treatment.code,
    });

    const updated = await this.prisma.treatment.update({
      where: { id },
      data: {
        ...this.buildTreatmentData(nestedData),
        companyId: nextCompanyId,
        code: generatedCode.code,
        ...this.buildNestedUpdateInput(nestedData),
      },
      include: { dataSubjects: true, treatmentDataItems: true, treatmentLegalBases: true,
        treatmentThirdParties: true, internationalTransfers: true, treatmentRetention: true,
        treatmentSecurityMeasures: true, lifecyclePhases: true, riskAssessment: true },
    });

    await this.audit.log({
      userId: currentUser.userId, companyId: treatment.companyId,
      action: 'TREATMENT_UPDATED', entityName: 'Treatment', entityId: id,
      oldValuesJson: JSON.stringify(treatment),
      newValuesJson: JSON.stringify({ ...dto, code: generatedCode.code, companyId: nextCompanyId }),
    });

    return updated;
  }

  async changeStatus(id: string, dto: ChangeStatusDto, currentUser: CurrentUser) {
    const treatment = await this.findOne(id, currentUser);
    const newStatus = dto.status;

    this.stateMachine.assertValidTransition(treatment.currentStatus, newStatus, currentUser.roleCode === 'SUPER_ADMIN');
    this.stateMachine.assertStatusChangePermission(treatment, newStatus, currentUser);
    await this.stateMachine.assertBusinessRulesForTransition(id, newStatus, treatment.currentStatus);

    if (newStatus === TreatmentStatus.ENVIADO) {
      await this.completenessService.validateCompleteness(id);
    }

    const updated = await this.prisma.treatment.update({
      where: { id },
      data: {
        currentStatus: newStatus,
        submissionDate: newStatus === TreatmentStatus.ENVIADO ? new Date() : treatment.submissionDate,
        approvalDate: newStatus === TreatmentStatus.APROBADO ? new Date() : treatment.approvalDate,
        reviewedByUserId: this.stateMachine.getReviewerField(newStatus, treatment.reviewedByUserId, currentUser.userId),
      },
    });

    await this.createStatusHistory(id, treatment.currentStatus, newStatus, currentUser.userId, dto.comment || `Cambio de estado a ${newStatus}`);

    if ([TreatmentStatus.ENVIADO, TreatmentStatus.APROBADO].some(s => s === newStatus)) {
      await this.riskService.evaluateRisk(id);
    }

    await this.audit.log({
      userId: currentUser.userId, companyId: treatment.companyId,
      action: 'TREATMENT_STATUS_CHANGED', entityName: 'Treatment', entityId: id,
      oldValuesJson: JSON.stringify({ status: treatment.currentStatus }),
      newValuesJson: JSON.stringify({ status: newStatus, comment: dto.comment }),
    });

    this.notificationService.notifyStatusChange(id, newStatus, dto.comment, currentUser).catch(() => {});

    return updated;
  }

  async delete(id: string, currentUser: CurrentUser) {
    const treatment = await this.findOne(id, currentUser);
    if (treatment.currentStatus !== TreatmentStatus.BORRADOR) {
      throw new BadRequestException('Solo se pueden eliminar tratamientos en borrador');
    }
    await this.prisma.treatment.delete({ where: { id } });
    await this.audit.log({
      userId: currentUser.userId, companyId: treatment.companyId,
      action: 'TREATMENT_DELETED', entityName: 'Treatment', entityId: id,
      oldValuesJson: JSON.stringify(treatment),
    });
    return { message: 'Tratamiento eliminado' };
  }

  // ═══════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════════

  private buildListWhere(
    currentUser: CurrentUser,
    query: { companyId?: string; areaId?: string; status?: string; search?: string },
  ) {
    const where = this.accessService.buildAccessWhere(currentUser);

    if (currentUser.roleCode === 'SUPER_ADMIN' && query.companyId) {
      (where as Record<string, unknown>).companyId = query.companyId;
    }
    if (query.areaId) (where as Record<string, unknown>).areaId = query.areaId;
    if (query.status) {
      const statuses = query.status.split(',').map((s) => s.trim()).filter(Boolean);
      (where as Record<string, unknown>).currentStatus = statuses.length > 1 ? { in: statuses } : statuses[0];
    }
    if (query.search) {
      (where as Record<string, unknown>).OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { mainPurpose: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    return where;
  }

  private validateCreateUpdate(data: any, existing?: any): void {
    this.validationService.assertCrossPhaseConsistency({
      internationalTransfer: data.internationalTransfer ?? existing?.internationalTransfer,
      thirdParties: data.thirdParties ?? existing?.treatmentThirdParties,
      internationalTransfers: data.internationalTransfers ?? existing?.internationalTransfers,
      medium: data.medium ?? existing?.medium,
      technologies: data.technologies ?? existing?.technologies,
      linkedDocuments: data.linkedDocuments ?? existing?.linkedDocuments,
      lifecycle: data.lifecycle ?? existing?.lifecyclePhases,
    });
    this.validationService.assertAutomatedProcessingCompleteness({
      profiling: data.profiling ?? existing?.profiling,
      profilingDescription: data.profilingDescription ?? existing?.profilingDescription,
      automatedDecisions: data.automatedDecisions ?? existing?.automatedDecisions,
      automatedDecisionsDescription: data.automatedDecisionsDescription ?? existing?.automatedDecisionsDescription,
      automatedDecisionsLogic: data.automatedDecisionsLogic ?? existing?.automatedDecisionsLogic,
      automatedDecisionsConsequences: data.automatedDecisionsConsequences ?? existing?.automatedDecisionsConsequences,
      humanInterventionAvailable: data.humanInterventionAvailable ?? existing?.humanInterventionAvailable,
      usesAi: data.usesAi ?? existing?.usesAi,
      aiSystemDescription: data.aiSystemDescription ?? existing?.aiSystemDescription,
    });
  }

  private buildTreatmentData(data: Record<string, unknown>): any {
    const {
      dataSubjects, dataItems, legalBases, retention,
      securityMeasures, thirdParties, internationalTransfers,
      lifecycle, riskAssessment, ...treatmentData
    } = data;
    return treatmentData;
  }

  private buildNestedCreateInput(data: Record<string, unknown>): any {
    const result: Record<string, unknown> = {};
    const subjects = data.dataSubjects as unknown[] | undefined;
    const items = data.dataItems as unknown[] | undefined;
    const bases = data.legalBases as unknown[] | undefined;
    const measures = data.securityMeasures as unknown[] | undefined;
    const parties = data.thirdParties as unknown[] | undefined;
    const transfers = data.internationalTransfers as unknown[] | undefined;
    const lifecycle = data.lifecycle as unknown[] | undefined;
    if (subjects?.length) result.dataSubjects = { create: subjects };
    if (items?.length) result.treatmentDataItems = { create: items };
    if (bases?.length) result.treatmentLegalBases = { create: bases };
    if (data.retention) result.treatmentRetention = { create: data.retention };
    if (measures?.length) result.treatmentSecurityMeasures = { create: measures };
    if (parties?.length) result.treatmentThirdParties = { create: parties };
    if (transfers?.length) result.internationalTransfers = { create: transfers };
    if (lifecycle?.length) result.lifecyclePhases = { create: lifecycle.map((item, index) => ({ ...(item as Record<string, unknown>), phaseOrder: index + 1 })) };
    if (data.riskAssessment) result.riskAssessment = { create: data.riskAssessment };
    return result;
  }

  private buildNestedUpdateInput(data: Record<string, unknown>): any {
    const result: Record<string, unknown> = {};
    const subjects = data.dataSubjects as unknown[] | undefined;
    const items = data.dataItems as unknown[] | undefined;
    const bases = data.legalBases as unknown[] | undefined;
    const parties = data.thirdParties as unknown[] | undefined;
    const transfers = data.internationalTransfers as unknown[] | undefined;
    const measures = data.securityMeasures as unknown[] | undefined;
    const lifecycle = data.lifecycle as unknown[] | undefined;
    if (subjects !== undefined) result.dataSubjects = { deleteMany: {}, ...(subjects.length ? { create: subjects } : {}) };
    if (items !== undefined) result.treatmentDataItems = { deleteMany: {}, ...(items.length ? { create: items } : {}) };
    if (bases !== undefined) result.treatmentLegalBases = { deleteMany: {}, ...(bases.length ? { create: bases } : {}) };
    if (parties !== undefined) result.treatmentThirdParties = { deleteMany: {}, ...(parties.length ? { create: parties } : {}) };
    if (transfers !== undefined) result.internationalTransfers = { deleteMany: {}, ...(transfers.length ? { create: transfers } : {}) };
    if (measures !== undefined) result.treatmentSecurityMeasures = { deleteMany: {}, ...(measures.length ? { create: measures } : {}) };
    if (lifecycle !== undefined) result.lifecyclePhases = { deleteMany: {}, ...(lifecycle.length ? { create: lifecycle.map((item, index) => ({ ...(item as Record<string, unknown>), phaseOrder: index + 1 })) } : {}) };
    if (data.retention !== undefined) result.treatmentRetention = { upsert: { create: data.retention, update: data.retention } };
    if (data.riskAssessment !== undefined) result.riskAssessment = { upsert: { create: data.riskAssessment, update: data.riskAssessment } };
    return result;
  }

  private async createStatusHistory(
    treatmentId: string,
    previousStatus: string,
    newStatus: string,
    changedByUserId: string,
    comment: string,
  ): Promise<void> {
    await this.prisma.statusHistory.create({
      data: { treatmentId, previousStatus, newStatus, changedByUserId, comment },
    });
  }
}
