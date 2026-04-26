import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CurrentUser } from '../../common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async findAll(
    currentUser: CurrentUser,
    query: { companyId?: string; areaId?: string; search?: string; roleCode?: string },
  ) {
    const where: Prisma.UserWhereInput = {};

    if (currentUser.roleCode !== 'SUPER_ADMIN') {
      where.companyId = currentUser.companyId;
    } else if (query.companyId) {
      where.companyId = query.companyId;
    }

    if (query.areaId) where.areaId = query.areaId;
    if (query.roleCode) where.role = { code: query.roleCode };

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      include: { role: true, company: true, area: true },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone,
      position: u.position,
      isActive: u.isActive,
      role: u.role,
      company: u.company,
      area: u.area,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    }));
  }

  async findOne(id: string, currentUser: CurrentUser) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true, company: true, area: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (currentUser.roleCode !== 'SUPER_ADMIN' && user.companyId !== currentUser.companyId) {
      throw new ForbiddenException('No tienes permiso para ver este usuario');
    }
    return user;
  }

  async create(dto: CreateUserDto, currentUser: CurrentUser) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('El correo ya está registrado');

    if (currentUser.roleCode !== 'SUPER_ADMIN') {
      (dto as CreateUserDto & { companyId?: string }).companyId = currentUser.companyId;
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const { password, ...rest } = dto as CreateUserDto & { password: string; companyId?: string };

    const user = await this.prisma.user.create({
      data: {
        ...rest,
        passwordHash,
      },
      include: { role: true, company: true, area: true },
    });

    await this.audit.log({
      userId: currentUser.userId,
      companyId: user.companyId || undefined,
      action: 'USER_CREATED',
      entityName: 'User',
      entityId: user.id,
      newValuesJson: JSON.stringify({ email: user.email, roleId: user.roleId }),
    });

    return user;
  }

  async update(id: string, dto: UpdateUserDto, currentUser: CurrentUser) {
    const user = await this.findOne(id, currentUser);

    if (dto.email && dto.email !== user.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existing) throw new ConflictException('El correo ya está registrado');
    }

    const data: Prisma.UserUpdateInput = { ...dto };
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 12);
      delete (data as any).password;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      include: { role: true, company: true, area: true },
    });

    await this.audit.log({
      userId: currentUser.userId,
      companyId: updated.companyId || undefined,
      action: 'USER_UPDATED',
      entityName: 'User',
      entityId: id,
      oldValuesJson: JSON.stringify(user),
      newValuesJson: JSON.stringify(data),
    });

    return updated;
  }

  async toggleStatus(id: string, currentUser: CurrentUser) {
    const user = await this.findOne(id, currentUser);
    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      include: { role: true, company: true, area: true },
    });
    await this.audit.log({
      userId: currentUser.userId,
      companyId: updated.companyId || undefined,
      action: 'USER_STATUS_TOGGLED',
      entityName: 'User',
      entityId: id,
      oldValuesJson: JSON.stringify({ isActive: user.isActive }),
      newValuesJson: JSON.stringify({ isActive: updated.isActive }),
    });

    return updated;
  }
}
