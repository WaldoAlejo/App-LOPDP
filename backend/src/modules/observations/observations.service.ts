import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.prisma.observation.update({
      where: { id },
      data: { status: 'cerrada' },
    });
  }
}
