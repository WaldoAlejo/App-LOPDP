import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Service responsible for evaluating treatment risk levels.
 * Automatically updates risk flags and DPIA requirements based on assessment data.
 */
@Injectable()
export class TreatmentRiskService {
  constructor(private prisma: PrismaService) {}

  /**
   * Evaluates the risk level of a treatment based on its data items and risk assessment.
   * Updates the treatment and risk assessment records with the results.
   */
  async evaluateRisk(treatmentId: string): Promise<void> {
    const treatment = await this.prisma.treatment.findUnique({
      where: { id: treatmentId },
      include: {
        treatmentDataItems: { include: { dataItem: true } },
        riskAssessment: true,
      },
    });

    if (!treatment) return;

    let hasSpecialCategories = false;

    for (const item of treatment.treatmentDataItems) {
      if (item.dataItem?.isSensitive) hasSpecialCategories = true;
    }

    const ra = treatment.riskAssessment;
    const isHighRisk =
      !!ra &&
      (ra.usesSpecialCategories ||
        ra.involvesChildren ||
        ra.biometricData ||
        ra.healthData ||
        ra.criminalData ||
        ra.automatedDecisions ||
        ra.systematicMonitoring ||
        ra.potentialHighImpact);

    const requiresDpia =
      !!ra &&
      ((ra.usesSpecialCategories && ra.largeScale) ||
        ra.automatedDecisions ||
        ra.systematicMonitoring ||
        ra.potentialHighImpact);

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
