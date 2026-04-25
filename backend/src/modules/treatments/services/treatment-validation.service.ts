import { BadRequestException, Injectable } from '@nestjs/common';

/**
 * Service responsible for business validation rules for treatments.
 * Validates cross-phase consistency, automated processing completeness, and status transitions.
 */
@Injectable()
export class TreatmentValidationService {
  /**
   * Validates that automated processing fields are complete when flags are enabled.
   */
  assertAutomatedProcessingCompleteness(data: {
    profiling?: boolean | null;
    profilingDescription?: string | null;
    automatedDecisions?: boolean | null;
    automatedDecisionsDescription?: string | null;
    automatedDecisionsLogic?: string | null;
    automatedDecisionsConsequences?: string | null;
    humanInterventionAvailable?: boolean | null;
    usesAi?: boolean | null;
    aiSystemDescription?: string | null;
  }): void {
    if (data.profiling && !data.profilingDescription?.trim()) {
      throw new BadRequestException(
        'Si el tratamiento incluye perfilamiento, debe documentar su finalidad y consecuencias',
      );
    }

    if (data.automatedDecisions) {
      if (!data.automatedDecisionsDescription?.trim()) {
        throw new BadRequestException(
          'Si el tratamiento incluye decisiones automatizadas, debe documentar su descripción general',
        );
      }
      if (!data.automatedDecisionsLogic?.trim()) {
        throw new BadRequestException(
          'Si el tratamiento incluye decisiones automatizadas, debe documentar la lógica o criterios del sistema',
        );
      }
      if (!data.automatedDecisionsConsequences?.trim()) {
        throw new BadRequestException(
          'Si el tratamiento incluye decisiones automatizadas, debe documentar sus consecuencias para el titular',
        );
      }
      if (!data.humanInterventionAvailable) {
        throw new BadRequestException(
          'Si el tratamiento incluye decisiones automatizadas, debe registrar la disponibilidad de intervención humana',
        );
      }
    }

    if (data.usesAi && !data.aiSystemDescription?.trim()) {
      throw new BadRequestException(
        'Si el tratamiento usa sistemas de IA, debe documentar su funcionamiento y medidas de mitigación',
      );
    }
  }

  /**
   * Validates consistency between different sections of the treatment form.
   * Ensures that international transfers, lifecycle phases, and general fields are aligned.
   */
  assertCrossPhaseConsistency(data: {
    internationalTransfer?: boolean | null;
    thirdParties?: Array<{ transferOutsideCountry?: boolean | null }>;
    internationalTransfers?: Array<{
      countryId?: string | null;
      thirdPartyId?: string | null;
      destinationName?: string | null;
      transferredDataDescription?: string | null;
      purpose?: string | null;
      safeguards?: string | null;
    }>;
    medium?: string | null;
    technologies?: string | null;
    linkedDocuments?: string | null;
    lifecycle?: Array<{
      lifecyclePhaseId?: string | null;
      mediumOrSupport?: string | null;
      technologies?: string | null;
      linkedDocuments?: string | null;
      activityDescription?: string | null;
    }>;
  }): void {
    const hasInternationalTransferFlag = !!data.internationalTransfer;
    const hasThirdPartyOutsideCountry = (data.thirdParties || []).some(
      (item) => !!item.transferOutsideCountry,
    );
    const internationalTransfers = data.internationalTransfers || [];

    if (
      (hasInternationalTransferFlag || hasThirdPartyOutsideCountry) &&
      internationalTransfers.length === 0
    ) {
      throw new BadRequestException(
        'Debe registrar transferencias internacionales cuando el tratamiento las declara o un tercero transfiere datos fuera del país',
      );
    }

    if (internationalTransfers.length > 0 && !hasInternationalTransferFlag) {
      throw new BadRequestException(
        'Si registra transferencias internacionales, debe marcar el tratamiento con transferencia internacional',
      );
    }

    const lifecycle = data.lifecycle || [];
    const uniquePhaseIds = new Set<string>();
    for (const phase of lifecycle) {
      if (!phase.lifecyclePhaseId) continue;
      if (uniquePhaseIds.has(phase.lifecyclePhaseId)) {
        throw new BadRequestException(
          'No se puede repetir la misma fase del ciclo de vida dentro de un tratamiento',
        );
      }
      uniquePhaseIds.add(phase.lifecyclePhaseId);
    }

    const hasGeneralMedium = !!data.medium?.trim();
    const hasGeneralTechnologies = !!data.technologies?.trim();
    const hasGeneralLinkedDocuments = !!data.linkedDocuments?.trim();
    const hasLifecycleMedium = lifecycle.some((item) => !!item.mediumOrSupport?.trim());
    const hasLifecycleTechnologies = lifecycle.some((item) => !!item.technologies?.trim());
    const hasLifecycleLinkedDocuments = lifecycle.some((item) => !!item.linkedDocuments?.trim());

    if (lifecycle.length > 0 && hasGeneralMedium && !hasLifecycleMedium) {
      throw new BadRequestException(
        'Si registra un soporte general en tecnologías y soportes, al menos una fase del ciclo de vida debe reflejarlo',
      );
    }

    if (lifecycle.length > 0 && hasGeneralTechnologies && !hasLifecycleTechnologies) {
      throw new BadRequestException(
        'Si registra tecnologías generales en el paso 6, al menos una fase del ciclo de vida debe reflejarlas',
      );
    }

    if (lifecycle.length > 0 && hasGeneralLinkedDocuments && !hasLifecycleLinkedDocuments) {
      throw new BadRequestException(
        'Si registra documentos vinculados en el paso 6, al menos una fase del ciclo de vida debe referenciarlos',
      );
    }

    if (hasLifecycleMedium && !hasGeneralMedium) {
      throw new BadRequestException(
        'Si detalla soportes por fase, debe registrar también un soporte general en tecnologías y soportes',
      );
    }

    if (hasLifecycleTechnologies && !hasGeneralTechnologies) {
      throw new BadRequestException(
        'Si detalla tecnologías por fase, debe registrar también tecnologías generales en el paso 6',
      );
    }

    if (hasLifecycleLinkedDocuments && !hasGeneralLinkedDocuments) {
      throw new BadRequestException(
        'Si detalla documentos por fase, debe registrar también documentos vinculados en el paso 6',
      );
    }
  }
}
