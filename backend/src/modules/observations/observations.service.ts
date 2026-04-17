import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateObservationDto } from './dto/create-observation.dto';

@Injectable()
export class ObservationsService {
  constructor(private prisma: PrismaService) {}

  async findByTreatment(treatmentId: string) {
    return this.prisma.observation.findMany({
      where: { treatmentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateObservationDto, currentUser: any) {
    const treatment = await this.prisma.treatment.findUnique({
      where: { id: dto.treatmentId },
      select: { id: true, currentStatus: true },
    });

    if (!treatment) {
      throw new NotFoundException('Tratamiento no encontrado');
    }

    if (!['enviado', 'en_revision_dpo', 'subsanado', 'validado', 'requiere_eipd'].includes(treatment.currentStatus)) {
      throw new BadRequestException('Solo se pueden registrar observaciones durante la revisión DPO o la re-revisión de subsanaciones');
    }

    return this.prisma.observation.create({
      data: {
        treatmentId: dto.treatmentId,
        sectionCode: dto.sectionCode,
        message: dto.message,
        createdByUserId: currentUser.userId,
        creatorRole: currentUser.roleCode,
        status: 'abierta',
      },
    });
  }

  async resolve(id: string) {
    const obs = await this.prisma.observation.findUnique({ where: { id } });
    if (!obs) throw new NotFoundException('Observación no encontrada');

    const treatment = await this.prisma.treatment.findUnique({
      where: { id: obs.treatmentId },
      select: { id: true, currentStatus: true },
    });

    if (!treatment) {
      throw new NotFoundException('Tratamiento no encontrado');
    }

    if (treatment.currentStatus !== 'en_correccion') {
      throw new BadRequestException('Las observaciones solo se pueden cerrar mientras el tratamiento está en corrección');
    }

    return this.prisma.observation.update({
      where: { id },
      data: { status: 'cerrada' },
    });
  }
}
