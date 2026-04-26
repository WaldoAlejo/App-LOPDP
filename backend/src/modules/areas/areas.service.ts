import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import type { CurrentUser } from '../../common/interfaces/current-user.interface';

@Injectable()
export class AreasService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    const where = companyId ? { companyId } : {};
    return this.prisma.area.findMany({
      where,
      include: { company: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, currentUser?: CurrentUser) {
    const area = await this.prisma.area.findUnique({
      where: { id },
      include: { company: true, processes: true },
    });
    if (!area) throw new NotFoundException('Área no encontrada');
    if (currentUser && currentUser.roleCode !== 'SUPER_ADMIN' && area.companyId !== currentUser.companyId) {
      throw new ForbiddenException('No tienes acceso a esta área');
    }
    return area;
  }

  async create(dto: CreateAreaDto) {
    return this.prisma.area.create({
      data: dto,
      include: { company: true },
    });
  }

  async update(id: string, dto: UpdateAreaDto) {
    await this.findOne(id);
    return this.prisma.area.update({
      where: { id },
      data: dto,
      include: { company: true },
    });
  }

  async toggleStatus(id: string) {
    const area = await this.findOne(id);
    return this.prisma.area.update({
      where: { id },
      data: { isActive: !area.isActive },
      include: { company: true },
    });
  }
}
