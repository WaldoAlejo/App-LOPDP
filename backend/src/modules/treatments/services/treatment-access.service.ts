import { Injectable, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CurrentUser } from '../../../common';
import { ROLE_SETS } from '../../../common';

/**
 * Service responsible for access control logic for treatments.
 * Centralizes authorization rules to avoid duplication across services.
 */
@Injectable()
export class TreatmentAccessService {
  /**
   * Builds the Prisma where clause for treatment queries based on user permissions.
   */
  buildAccessWhere(currentUser: CurrentUser): Prisma.TreatmentWhereInput {
    if (currentUser.roleCode === 'SUPER_ADMIN') {
      return {};
    }

    if (ROLE_SETS.COMPANY_WIDE_TREATMENT.has(currentUser.roleCode as any)) {
      return { companyId: currentUser.companyId };
    }

    return {
      companyId: currentUser.companyId,
      OR: [
        { createdByUserId: currentUser.userId },
        { treatmentResponsibleUserId: currentUser.userId },
        { process: { responsibleUserId: currentUser.userId } },
      ],
    };
  }

  /**
   * Asserts that the user has access to a specific treatment.
   */
  assertAccessToTreatment(
    treatment: {
      companyId: string | null;
      createdByUserId: string;
      treatmentResponsibleUserId: string | null;
      process?: { responsibleUserId: string | null } | null;
    },
    currentUser: CurrentUser,
  ): void {
    if (currentUser.roleCode === 'SUPER_ADMIN') return;

    if (treatment.companyId !== currentUser.companyId) {
      throw new ForbiddenException('No tienes permiso para ver este tratamiento');
    }

    if (ROLE_SETS.COMPANY_WIDE_TREATMENT.has(currentUser.roleCode as any)) {
      return;
    }

    const hasScopedAccess =
      treatment.createdByUserId === currentUser.userId ||
      treatment.treatmentResponsibleUserId === currentUser.userId ||
      treatment.process?.responsibleUserId === currentUser.userId;

    if (!hasScopedAccess) {
      throw new ForbiddenException('No tienes permiso para ver este tratamiento');
    }
  }

  /**
   * Asserts that the user belongs to a company (unless SUPER_ADMIN).
   */
  assertUserHasCompany(currentUser: CurrentUser): void {
    if (!currentUser.companyId && currentUser.roleCode !== 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'Tu usuario no está asociado a ninguna empresa. Contacta al administrador.',
      );
    }
  }
}
