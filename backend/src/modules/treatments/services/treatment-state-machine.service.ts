import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleCode, ROLE_SETS, TreatmentStatus, STATUS_FLOW, VALID_STATUSES, RoleCodeType, TreatmentStatusType } from '../../../common';
import { CurrentUser } from '../../../common';

/**
 * Service responsible for treatment status transitions and permissions.
 * Implements the state machine logic for the treatment approval workflow.
 */
@Injectable()
export class TreatmentStateMachineService {
  constructor(private prisma: PrismaService) {}

  /**
   * Asserts that the user has permission to change the treatment to the new status.
   */
  assertStatusChangePermission(
    treatment: { currentStatus: string; companyId: string | null },
    newStatus: string,
    currentUser: CurrentUser,
  ): void {
    if (currentUser.roleCode === RoleCode.SUPER_ADMIN) return;

    // Review statuses: only SUPER_ADMIN and DPO can assign
    const reviewStatuses = new Set<string>([
      TreatmentStatus.EN_REVISION_DPO,
      TreatmentStatus.VALIDADO,
      TreatmentStatus.APROBADO,
      TreatmentStatus.REQUIERE_EIPD,
    ]);

    if (reviewStatuses.has(newStatus)) {
      if (!ROLE_SETS.REVIEW_AUTHORITY.has(currentUser.roleCode as RoleCodeType)) {
        throw new ForbiddenException(
          'Solo el DPO puede ejecutar acciones de revisión sobre el tratamiento',
        );
      }
      return;
    }

    // DPO can mark as 'observado'
    if (newStatus === TreatmentStatus.OBSERVADO) {
      if (!ROLE_SETS.REVIEW_AUTHORITY.has(currentUser.roleCode as RoleCodeType)) {
        throw new ForbiddenException(
          'Solo el DPO puede marcar un tratamiento como observado',
        );
      }
      return;
    }

    // Responsible can start correction from 'observado'
    if (
      newStatus === TreatmentStatus.EN_CORRECCION &&
      treatment.currentStatus === TreatmentStatus.OBSERVADO
    ) {
      if (
        !ROLE_SETS.OPERATIONAL_TREATMENT.has(currentUser.roleCode as RoleCodeType) &&
        !ROLE_SETS.REVIEW_AUTHORITY.has(currentUser.roleCode as RoleCodeType)
      ) {
        throw new ForbiddenException(
          'Tu rol no puede iniciar la corrección de este tratamiento',
        );
      }
      return;
    }

    // Only DPO can return a subsanación to correction
    if (
      newStatus === TreatmentStatus.EN_CORRECCION &&
      treatment.currentStatus === TreatmentStatus.SUBSANADO
    ) {
      if (!ROLE_SETS.REVIEW_AUTHORITY.has(currentUser.roleCode as RoleCodeType)) {
        throw new ForbiddenException(
          'Solo el DPO puede devolver una subsanación a corrección',
        );
      }
      return;
    }

    if (
      !ROLE_SETS.OPERATIONAL_TREATMENT.has(currentUser.roleCode as RoleCodeType) &&
      !ROLE_SETS.REVIEW_AUTHORITY.has(currentUser.roleCode as RoleCodeType)
    ) {
      throw new ForbiddenException('Tu rol no puede cambiar el estado de este tratamiento');
    }
  }

  /**
   * Validates that the status transition is allowed according to the state machine.
   */
  assertValidTransition(currentStatus: string, newStatus: string, isSuperAdmin: boolean): void {
    if (!VALID_STATUSES.some(s => s === newStatus)) {
      throw new BadRequestException('Estado no válido');
    }

    const allowedTransitions = (STATUS_FLOW as Record<string, string[]>)[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus) && !isSuperAdmin) {
      throw new BadRequestException(
        `No se puede cambiar de ${currentStatus} a ${newStatus}`,
      );
    }
  }

  /**
   * Validates business rules specific to each status transition.
   * Checks for open observations, completeness, etc.
   */
  async assertBusinessRulesForTransition(
    treatmentId: string,
    newStatus: string,
    currentStatus: string,
  ): Promise<void> {
    const openObservations = [
      TreatmentStatus.OBSERVADO,
      TreatmentStatus.EN_CORRECCION,
      TreatmentStatus.SUBSANADO,
      TreatmentStatus.VALIDADO,
      TreatmentStatus.APROBADO,
    ].some(s => s === newStatus)
      ? await this.prisma.observation.count({
          where: { treatmentId, status: 'abierta' },
        })
      : 0;

    if (newStatus === TreatmentStatus.OBSERVADO && openObservations === 0) {
      throw new BadRequestException(
        'No se puede marcar como observado sin registrar observaciones abiertas',
      );
    }

    if (newStatus === TreatmentStatus.SUBSANADO) {
      if (openObservations > 0) {
        throw new BadRequestException(
          'No se puede reenviar una subsanación mientras existan observaciones abiertas',
        );
      }

      const totalObservations = await this.prisma.observation.count({
        where: { treatmentId },
      });
      if (totalObservations === 0) {
        throw new BadRequestException(
          'No se puede marcar como subsanado un tratamiento que no haya sido observado',
        );
      }
    }

    if (
      newStatus === TreatmentStatus.EN_CORRECCION &&
      [TreatmentStatus.OBSERVADO, TreatmentStatus.SUBSANADO].some(s => s === currentStatus) &&
      openObservations === 0
    ) {
      throw new BadRequestException(
        'No se puede devolver a corrección sin observaciones abiertas',
      );
    }

    if (
      [TreatmentStatus.VALIDADO, TreatmentStatus.APROBADO].some(s => s === newStatus) &&
      openObservations > 0
    ) {
      throw new BadRequestException(
        `No se puede pasar a ${newStatus} con observaciones abiertas`,
      );
    }
  }

  /**
   * Determines which user field should be updated based on the new status.
   */
  getReviewerField(
    newStatus: string,
    currentReviewerId: string | null,
    currentUserId: string,
  ): string | null | undefined {
    const reviewStatuses = [
      TreatmentStatus.EN_REVISION_DPO,
      TreatmentStatus.VALIDADO,
      TreatmentStatus.APROBADO,
      TreatmentStatus.OBSERVADO,
      TreatmentStatus.EN_CORRECCION,
      TreatmentStatus.REQUIERE_EIPD,
    ];
    return reviewStatuses.some(s => s === newStatus) ? currentUserId : currentReviewerId;
  }
}
