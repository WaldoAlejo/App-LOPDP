import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TreatmentValidationService } from './treatment-validation.service';

/**
 * Service responsible for validating treatment completeness before submission.
 */
@Injectable()
export class TreatmentCompletenessService {
  constructor(
    private prisma: PrismaService,
    private validationService: TreatmentValidationService,
  ) {}

  /**
   * Validates that a treatment has all required fields before submission.
   */
  async validateCompleteness(id: string): Promise<void> {
    const treatment = await this.prisma.treatment.findUnique({
      where: { id },
      include: {
        dataSubjects: true,
        treatmentDataItems: true,
        treatmentLegalBases: true,
        treatmentThirdParties: true,
        internationalTransfers: true,
        treatmentRetention: true,
        treatmentSecurityMeasures: true,
        lifecyclePhases: true,
      },
    });

    if (!treatment) throw new NotFoundException('Tratamiento no encontrado');

    const missing: string[] = [];
    if (!treatment.name) missing.push('nombre');
    if (!treatment.mainPurpose) missing.push('finalidad principal');
    if (treatment.dataSubjects.length === 0) missing.push('titulares');
    if (treatment.treatmentDataItems.length === 0) missing.push('datos tratados');
    if (treatment.treatmentLegalBases.length === 0) missing.push('base de legitimación');
    if (!treatment.treatmentRetention) missing.push('conservación');
    if (treatment.treatmentSecurityMeasures.length === 0) missing.push('medidas de seguridad');

    if (missing.length > 0) {
      throw new BadRequestException(
        `Faltan campos obligatorios: ${missing.join(', ')}`,
      );
    }

    this.validationService.assertCrossPhaseConsistency({
      internationalTransfer: treatment.internationalTransfer,
      thirdParties: treatment.treatmentThirdParties,
      internationalTransfers: treatment.internationalTransfers,
      medium: treatment.medium,
      technologies: treatment.technologies,
      linkedDocuments: treatment.linkedDocuments,
      lifecycle: treatment.lifecyclePhases,
    });

    this.validationService.assertAutomatedProcessingCompleteness(treatment);
  }
}
