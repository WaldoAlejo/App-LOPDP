import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: { areas: true, processes: true, users: true },
    });
    if (!company) throw new NotFoundException('Empresa no encontrada');
    return company;
  }

  async create(dto: CreateCompanyDto) {
    const existing = await this.prisma.company.findUnique({ where: { ruc: dto.ruc } });
    if (existing) throw new ConflictException('Ya existe una empresa con ese RUC');
    return this.prisma.company.create({ data: dto });
  }

  async update(id: string, dto: UpdateCompanyDto) {
    await this.findOne(id);
    if (dto.ruc) {
      const existing = await this.prisma.company.findFirst({
        where: { ruc: dto.ruc, NOT: { id } },
      });
      if (existing) throw new ConflictException('Ya existe otra empresa con ese RUC');
    }
    return this.prisma.company.update({ where: { id }, data: dto });
  }

  async toggleStatus(id: string) {
    const company = await this.findOne(id);
    return this.prisma.company.update({
      where: { id },
      data: { isActive: !company.isActive },
    });
  }
}
