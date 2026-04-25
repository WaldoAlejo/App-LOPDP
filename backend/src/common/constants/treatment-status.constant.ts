/**
 * Treatment status codes and flow definitions.
 * Use these constants instead of string literals.
 */

export const TreatmentStatus = {
  BORRADOR: 'borrador',
  EN_EDICION: 'en_edicion',
  ENVIADO: 'enviado',
  EN_REVISION_DPO: 'en_revision_dpo',
  OBSERVADO: 'observado',
  EN_CORRECCION: 'en_correccion',
  SUBSANADO: 'subsanado',
  VALIDADO: 'validado',
  APROBADO: 'aprobado',
  REQUIERE_EIPD: 'requiere_eipd',
  ARCHIVADO: 'archivado',
  REEMPLAZADO: 'reemplazado',
} as const;

export type TreatmentStatusType = (typeof TreatmentStatus)[keyof typeof TreatmentStatus];

/**
 * Valid status values for validation
 */
export const VALID_STATUSES: TreatmentStatusType[] = Object.values(TreatmentStatus);

/**
 * Status flow: which statuses can transition to which
 */
export const STATUS_FLOW: Record<TreatmentStatusType, TreatmentStatusType[]> = {
  [TreatmentStatus.BORRADOR]: [TreatmentStatus.EN_EDICION, TreatmentStatus.ENVIADO],
  [TreatmentStatus.EN_EDICION]: [TreatmentStatus.BORRADOR, TreatmentStatus.ENVIADO],
  [TreatmentStatus.ENVIADO]: [TreatmentStatus.EN_REVISION_DPO, TreatmentStatus.OBSERVADO, TreatmentStatus.APROBADO, TreatmentStatus.REQUIERE_EIPD],
  [TreatmentStatus.EN_REVISION_DPO]: [TreatmentStatus.OBSERVADO, TreatmentStatus.VALIDADO, TreatmentStatus.APROBADO, TreatmentStatus.REQUIERE_EIPD],
  [TreatmentStatus.OBSERVADO]: [TreatmentStatus.EN_CORRECCION],
  [TreatmentStatus.EN_CORRECCION]: [TreatmentStatus.SUBSANADO],
  [TreatmentStatus.SUBSANADO]: [TreatmentStatus.EN_REVISION_DPO, TreatmentStatus.OBSERVADO, TreatmentStatus.EN_CORRECCION, TreatmentStatus.APROBADO, TreatmentStatus.REQUIERE_EIPD],
  [TreatmentStatus.VALIDADO]: [TreatmentStatus.APROBADO, TreatmentStatus.OBSERVADO],
  [TreatmentStatus.APROBADO]: [TreatmentStatus.ARCHIVADO],
  [TreatmentStatus.REQUIERE_EIPD]: [TreatmentStatus.EN_REVISION_DPO, TreatmentStatus.APROBADO],
  [TreatmentStatus.ARCHIVADO]: [],
  [TreatmentStatus.REEMPLAZADO]: [],
};

/**
 * Human-readable status labels
 */
export const STATUS_LABELS: Record<TreatmentStatusType, string> = {
  [TreatmentStatus.BORRADOR]: 'Borrador',
  [TreatmentStatus.EN_EDICION]: 'En edición',
  [TreatmentStatus.ENVIADO]: 'Enviado',
  [TreatmentStatus.EN_REVISION_DPO]: 'En revisión DPO',
  [TreatmentStatus.OBSERVADO]: 'Observado',
  [TreatmentStatus.EN_CORRECCION]: 'En corrección',
  [TreatmentStatus.SUBSANADO]: 'Subsanado',
  [TreatmentStatus.VALIDADO]: 'Validado',
  [TreatmentStatus.APROBADO]: 'Aprobado',
  [TreatmentStatus.REQUIERE_EIPD]: 'Requiere EIPD',
  [TreatmentStatus.ARCHIVADO]: 'Archivado',
  [TreatmentStatus.REEMPLAZADO]: 'Reemplazado',
};

/**
 * Status colors for UI display
 */
export const STATUS_COLORS: Record<TreatmentStatusType, { bg: string; text: string }> = {
  [TreatmentStatus.BORRADOR]: { bg: 'bg-gray-100', text: 'text-gray-700' },
  [TreatmentStatus.EN_EDICION]: { bg: 'bg-blue-100', text: 'text-blue-700' },
  [TreatmentStatus.ENVIADO]: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  [TreatmentStatus.EN_REVISION_DPO]: { bg: 'bg-purple-100', text: 'text-purple-700' },
  [TreatmentStatus.OBSERVADO]: { bg: 'bg-orange-100', text: 'text-orange-700' },
  [TreatmentStatus.EN_CORRECCION]: { bg: 'bg-pink-100', text: 'text-pink-700' },
  [TreatmentStatus.SUBSANADO]: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  [TreatmentStatus.VALIDADO]: { bg: 'bg-teal-100', text: 'text-teal-700' },
  [TreatmentStatus.APROBADO]: { bg: 'bg-green-100', text: 'text-green-700' },
  [TreatmentStatus.REQUIERE_EIPD]: { bg: 'bg-red-100', text: 'text-red-700' },
  [TreatmentStatus.ARCHIVADO]: { bg: 'bg-slate-100', text: 'text-slate-700' },
  [TreatmentStatus.REEMPLAZADO]: { bg: 'bg-zinc-100', text: 'text-zinc-700' },
};
