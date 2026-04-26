import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogInput {
  userId?: string;
  companyId?: string;
  action: string;
  entityName: string;
  entityId?: string;
  oldValuesJson?: string;
  newValuesJson?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(input: AuditLogInput) {
    return this.prisma.audit.create({
      data: {
        userId: input.userId,
        companyId: input.companyId,
        action: input.action,
        entityName: input.entityName,
        entityId: input.entityId,
        oldValuesJson: input.oldValuesJson,
        newValuesJson: input.newValuesJson,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  }

  async findMany(query: {
    companyId?: string;
    userId?: string;
    entityName?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.AuditWhereInput = {};
    if (query.companyId) where.companyId = query.companyId;
    if (query.userId) where.userId = query.userId;
    if (query.entityName) where.entityName = { contains: query.entityName, mode: 'insensitive' };
    if (query.action) where.action = { contains: query.action, mode: 'insensitive' };
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) (where.createdAt as Prisma.DateTimeFilter).gte = new Date(query.startDate);
      if (query.endDate) (where.createdAt as Prisma.DateTimeFilter).lte = new Date(query.endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.audit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip || 0,
        take: query.take || 20,
      }),
      this.prisma.audit.count({ where }),
    ]);

    return { data, total };
  }
}
