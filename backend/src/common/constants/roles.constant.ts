/**
 * Role codes used throughout the application.
 * Use these constants instead of string literals to ensure consistency.
 */
export const RoleCode = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  COMPANY_ADMIN: 'COMPANY_ADMIN',
  DPO: 'DPO',
  LEGAL_REVIEWER: 'LEGAL_REVIEWER',
  PROCESS_LEADER: 'PROCESS_LEADER',
  SUPPORT: 'SUPPORT',
  AUDITOR: 'AUDITOR',
  SECURITY_LEAD: 'SECURITY_LEAD',
} as const;

export type RoleCodeType = (typeof RoleCode)[keyof typeof RoleCode];

/**
 * Role sets for access control checks.
 */
export const ROLE_SETS = {
  /** Roles that can view treatments across the company */
  COMPANY_WIDE_TREATMENT: new Set<RoleCodeType>([
    RoleCode.DPO,
    RoleCode.SECURITY_LEAD,
    RoleCode.AUDITOR,
  ]),

  /** Roles that can review and approve treatments */
  REVIEW_AUTHORITY: new Set<RoleCodeType>([
    RoleCode.SUPER_ADMIN,
    RoleCode.DPO,
  ]),

  /** Roles that can create and manage treatments operationally */
  OPERATIONAL_TREATMENT: new Set<RoleCodeType>([
    RoleCode.SUPER_ADMIN,
    RoleCode.COMPANY_ADMIN,
    RoleCode.PROCESS_LEADER,
    RoleCode.SUPPORT,
    RoleCode.AUDITOR,
    RoleCode.SECURITY_LEAD,
  ]),

  /** Roles that can manage users */
  USER_MANAGEMENT: new Set<RoleCodeType>([
    RoleCode.SUPER_ADMIN,
    RoleCode.COMPANY_ADMIN,
  ]),

  /** Roles that can view audit logs */
  AUDIT_ACCESS: new Set<RoleCodeType>([
    RoleCode.SUPER_ADMIN,
    RoleCode.DPO,
    RoleCode.AUDITOR,
    RoleCode.SECURITY_LEAD,
  ]),
} as const;

/**
 * Human-readable role labels
 */
export const ROLE_LABELS: Record<RoleCodeType, string> = {
  [RoleCode.SUPER_ADMIN]: 'Super Administrador',
  [RoleCode.COMPANY_ADMIN]: 'Administrador de Empresa',
  [RoleCode.DPO]: 'Delegado de Protección de Datos',
  [RoleCode.LEGAL_REVIEWER]: 'Revisor Jurídico',
  [RoleCode.PROCESS_LEADER]: 'Líder de Proceso',
  [RoleCode.SUPPORT]: 'Colaborador de Apoyo',
  [RoleCode.AUDITOR]: 'Auditor',
  [RoleCode.SECURITY_LEAD]: 'Líder de Seguridad',
};
