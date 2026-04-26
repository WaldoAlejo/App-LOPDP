import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateObservationDto } from './dto/create-observation.dto';
import { NotificationService } from '../notifications/notification.service';
import { CurrentUser, ROLE_SETS } from '../../common';

@Injectable()
export class ObservationsService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  private assertAccessToTreatment(
    treatment: {
      companyId: string | null;
      createdByUserId: string;
      treatmentResponsibleUserId: string | null;
      process?: { responsibleUserId: string | null } | null;
    },
    currentUser: CurrentUser,
  ) {
    if (currentUser.roleCode === 'SUPER_ADMIN') return;

    if (treatment.companyId !== currentUser.companyId) {
      throw new ForbiddenException('No tienes permiso para acceder a las observaciones de este tratamiento');
    }

    if (ROLE_SETS.COMPANY_WIDE_TREATMENT.has(currentUser.roleCode)) return;

    const hasScopedAccess =
      treatment.createdByUserId === currentUser.userId ||
      treatment.treatmentResponsibleUserId === currentUser.userId ||
      treatment.process?.responsibleUserId === currentUser.userId;

    if (!hasScopedAccess) {
      throw new ForbiddenException('No tienes permiso para acceder a las observaciones de este tratamiento');
    }
  }

  async findByTreatment(treatmentId: string, currentUser: CurrentUser) {
    const treatment = await this.prisma.treatment.findUnique({
      where: { id: treatmentId },
      select: {
        id: true, companyId: true, createdByUserId: true,
        treatmentResponsibleUserId: true,
        process: { select: { responsibleUserId: true } },
      },
    });

    if (!treatment) throw new NotFoundException('Tratamiento no encontrado');
    this.assertAccessToTreatment(treatment, currentUser);

    return this.prisma.observation.findMany({
      where: { treatmentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateObservationDto, currentUser: CurrentUser) {
    const treatment = await this.prisma.treatment.findUnique({
      where: { id: dto.treatmentId },
      select: {
        id: true, currentStatus: true, companyId: true,
        createdByUserId: true, treatmentResponsibleUserId: true,
        process: { select: { responsibleUserId: true } },
      },
    });

    if (!treatment) throw new NotFoundException('Tratamiento no encontrado');
    this.assertAccessToTreatment(treatment, currentUser);

    if (!ROLE_SETS.REVIEW_AUTHORITY.has(currentUser.roleCode)) {
      throw new ForbiddenException('Solo el DPO puede registrar observaciones en la revisión');
    }

    if (!['enviado', 'en_revision_dpo', 'subsanado', 'validado', 'requiere_eipd'].includes(treatment.currentStatus)) {
      throw new BadRequestException('Solo se pueden registrar observaciones durante la revisión DPO o la re-revisión de subsanaciones');
    }

    const [observation] = await this.prisma.$transaction([
      this.prisma.observation.create({
        data: {
          treatmentId: dto.treatmentId,
          sectionCode: dto.sectionCode,
          message: dto.message,
          createdByUserId: currentUser.userId,
          creatorRole: currentUser.roleCode,
          status: 'abierta',
        },
      }),
      this.prisma.treatment.update({
        where: { id: dto.treatmentId },
        data: { currentStatus: 'observado', reviewedByUserId: currentUser.userId },
      }),
    ]);

    this.notificationService.notifyNewObservation(dto.treatmentId, observation, currentUser).catch(() => {});

    return observation;
  }

  async resolve(id: string, currentUser: CurrentUser) {
    const obs = await this.prisma.observation.findUnique({ where: { id } });
    if (!obs) throw new NotFoundException('Observación no encontrada');

    const treatment = await this.prisma.treatment.findUnique({
      where: { id: obs.treatmentId },
      select: {
        id: true, currentStatus: true, companyId: true,
        createdByUserId: true, treatmentResponsibleUserId: true,
        process: { select: { responsibleUserId: true } },
      },
    });

    if (!treatment) throw new NotFoundException('Tratamiento no encontrado');
    this.assertAccessToTreatment(treatment, currentUser);

    if (treatment.currentStatus !== 'en_correccion') {
      throw new BadRequestException('Las observaciones solo se pueden cerrar mientras el tratamiento está en corrección');
    }

    const updated = await this.prisma.observation.update({
      where: { id },
      data: { status: 'cerrada' },
    });

    this.notificationService.notifyObservationResolved(id, currentUser).catch(() => {});

    return updated;
  }
}
