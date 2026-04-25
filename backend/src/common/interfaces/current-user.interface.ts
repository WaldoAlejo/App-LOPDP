/**
 * Authenticated user context available in requests.
 * Populated by JwtAuthGuard after JWT validation.
 */
export interface CurrentUser {
  /** User UUID */
  userId: string;

  /** User email */
  email?: string;

  /** Role code for authorization checks */
  roleCode: string;

  /** Company UUID (null for SUPER_ADMIN) */
  companyId?: string;

  /** Area UUID (optional) */
  areaId?: string;

  /** Process UUID (optional) */
  processId?: string;
}
