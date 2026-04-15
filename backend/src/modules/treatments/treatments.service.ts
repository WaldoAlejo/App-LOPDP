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

  async findAll(currentUser: any, query: { companyId?: string; areaId?: string; status?: string; search?: string }) {
    const where: any = {};

    if (currentUser.roleCode !== 'SUPER_ADMIN') {
      where.companyId = currentUser.companyId;
    } else if (query.companyId) {
      where.companyId = query.companyId;
    }

    if (query.areaId) where.areaId = query.areaId;
    if (query.status) where.currentStatus = query.status;

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

    const treatment = await this.prisma.treatment.create({
      data: {
        ...dto,
        createdByUserId: currentUser.userId,
        currentStatus: 'borrador',
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

    const updated = await this.prisma.treatment.update({
      where: { id },
      data: dto,
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

    // Validaciones específicas por estado
    if (newStatus === 'aprobado') {
      const openObservations = await this.prisma.observation.count({
        where: { treatmentId: id, status: 'abierta' },
      });
      if (openObservations > 0) {
        throw new BadRequestException('No se puede aprobar con observaciones abiertas');
      }
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
        treatmentRetention: true,
        treatmentSecurityMeasures: true,
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
