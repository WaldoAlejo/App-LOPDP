const COMPANY_WIDE_TREATMENT_ROLES = ['SUPER_ADMIN', 'DPO', 'SECURITY_LEAD', 'AUDITOR'];
const REPORT_ROLES = ['SUPER_ADMIN', 'DPO', 'SECURITY_LEAD', 'AUDITOR'];
const REVIEW_ROLES = ['SUPER_ADMIN', 'DPO', 'SECURITY_LEAD', 'AUDITOR', 'LEGAL_REVIEWER'];
const RISK_ROLES = ['SUPER_ADMIN', 'DPO', 'SECURITY_LEAD', 'AUDITOR'];
const AUDIT_ROLES = ['SUPER_ADMIN', 'DPO', 'SECURITY_LEAD', 'AUDITOR'];
const MANAGEMENT_ROLES = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO'];

export function hasRoleAccess(roleCode: string | undefined, allowedRoles: string[]) {
  return !!roleCode && allowedRoles.includes(roleCode);
}

export function canViewCompanyWideTreatments(roleCode: string | undefined) {
  return hasRoleAccess(roleCode, COMPANY_WIDE_TREATMENT_ROLES);
}

export function canDownloadRatMaster(roleCode: string | undefined) {
  return hasRoleAccess(roleCode, REPORT_ROLES);
}

export function canAccessReports(roleCode: string | undefined) {
  return hasRoleAccess(roleCode, REPORT_ROLES);
}

export function canAccessReviews(roleCode: string | undefined) {
  return hasRoleAccess(roleCode, REVIEW_ROLES);
}

export function canAccessRisks(roleCode: string | undefined) {
  return hasRoleAccess(roleCode, RISK_ROLES);
}

export function canAccessAudits(roleCode: string | undefined) {
  return hasRoleAccess(roleCode, AUDIT_ROLES);
}

export function canAccessManagement(roleCode: string | undefined) {
  return hasRoleAccess(roleCode, MANAGEMENT_ROLES);
}