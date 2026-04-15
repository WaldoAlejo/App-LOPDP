import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VersionsService {
  constructor(private prisma: PrismaService) {}

  async findByTreatment(treatmentId: string) {
    return this.prisma.treatmentVersion.findMany({
      where: { treatmentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(treatmentId: string, snapshot: any, changeReason: string, currentUser: any) {
    const lastVersion = await this.prisma.treatmentVersion.findFirst({
      where: { treatmentId },
      orderBy: { versionNumber: 'desc' },
    });

    const versionNumber = (lastVersion?.versionNumber || 0) + 1;

    return this.prisma.treatmentVersion.create({
      data: {
        treatmentId,
        versionNumber,
        snapshotJson: JSON.stringify(snapshot),
        changeReason,
        createdByUserId: currentUser.userId,
      },
    });
  }
}
