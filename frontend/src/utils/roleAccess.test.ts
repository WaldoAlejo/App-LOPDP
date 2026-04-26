import { describe, it, expect } from 'vitest';
import {
  hasRoleAccess,
  canViewCompanyWideTreatments,
  canDownloadRatMaster,
  canAccessManagement,
} from './roleAccess';

describe('roleAccess', () => {
  describe('hasRoleAccess', () => {
    it('returns true when role is in allowed list', () => {
      expect(hasRoleAccess('DPO', ['DPO', 'ADMIN'])).toBe(true);
    });

    it('returns false when role is not in allowed list', () => {
      expect(hasRoleAccess('SUPPORT', ['DPO', 'ADMIN'])).toBe(false);
    });

    it('returns false for undefined role', () => {
      expect(hasRoleAccess(undefined, ['DPO'])).toBe(false);
    });
  });

  describe('canViewCompanyWideTreatments', () => {
    it('allows SUPER_ADMIN', () => {
      expect(canViewCompanyWideTreatments('SUPER_ADMIN')).toBe(true);
    });

    it('allows DPO', () => {
      expect(canViewCompanyWideTreatments('DPO')).toBe(true);
    });

    it('denies PROCESS_LEADER', () => {
      expect(canViewCompanyWideTreatments('PROCESS_LEADER')).toBe(false);
    });
  });

  describe('canDownloadRatMaster', () => {
    it('allows AUDITOR', () => {
      expect(canDownloadRatMaster('AUDITOR')).toBe(true);
    });

    it('denies COMPANY_ADMIN', () => {
      expect(canDownloadRatMaster('COMPANY_ADMIN')).toBe(false);
    });
  });

  describe('canAccessManagement', () => {
    it('allows SUPER_ADMIN', () => {
      expect(canAccessManagement('SUPER_ADMIN')).toBe(true);
    });

    it('allows COMPANY_ADMIN', () => {
      expect(canAccessManagement('COMPANY_ADMIN')).toBe(true);
    });

    it('allows DPO', () => {
      expect(canAccessManagement('DPO')).toBe(true);
    });

    it('denies PROCESS_LEADER', () => {
      expect(canAccessManagement('PROCESS_LEADER')).toBe(false);
    });
  });
});
