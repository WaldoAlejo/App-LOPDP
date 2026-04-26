import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import type { CurrentUser } from '../../common/interfaces/current-user.interface';

@Injectable()
export class ProcessesService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string, areaId?: string) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (areaId) where.areaId = areaId;
    return this.prisma.process.findMany({
      where,
      include: { company: true, area: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, currentUser?: CurrentUser) {
    const process = await this.prisma.process.findUnique({
      where: { id },
      include: { company: true, area: true },
    });
    if (!process) throw new NotFoundException('Proceso no encontrado');
    if (currentUser && currentUser.roleCode !== 'SUPER_ADMIN' && process.companyId !== currentUser.companyId) {
      throw new ForbiddenException('No tienes acceso a este proceso');
    }
    return process;
  }

  async create(dto: CreateProcessDto) {
    return this.prisma.process.create({
      data: dto,
      include: { company: true, area: true },
    });
  }

  async update(id: string, dto: UpdateProcessDto) {
    await this.findOne(id);
    return this.prisma.process.update({
      where: { id },
      data: dto,
      include: { company: true, area: true },
    });
  }

  async toggleStatus(id: string) {
    const process = await this.findOne(id);
    return this.prisma.process.update({
      where: { id },
      data: { isActive: !process.isActive },
      include: { company: true, area: true },
    });
  }
}
