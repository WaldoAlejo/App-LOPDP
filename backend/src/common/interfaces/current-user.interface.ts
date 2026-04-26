/**
 * Authenticated user context available in requests.
 * Populated by JwtAuthGuard after JWT validation.
 */
import type { RoleCodeType } from '../constants/roles.constant';

export interface CurrentUser {
  /** User UUID */
  userId: string;

  /** User email */
  email?: string;

  /** User first name */
  firstName?: string;

  /** User last name */
  lastName?: string;

  /** Role code for authorization checks */
  roleCode: RoleCodeType;

  /** Company UUID (null for SUPER_ADMIN) */
  companyId?: string;

  /** Area UUID (optional) */
  areaId?: string;

  /** Process UUID (optional) */
  processId?: string;
}
