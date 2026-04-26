import { describe, it, expect } from 'vitest';
import { isValidEmail, isStrongPassword } from './security';

describe('security', () => {
  describe('isValidEmail', () => {
    it('returns true for valid email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co')).toBe(true);
    });

    it('returns false for invalid email', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('returns true for strong password', () => {
      expect(isStrongPassword('Strong1!pass')).toBe(true);
      expect(isStrongPassword('MyP@ssw0rd')).toBe(true);
    });

    it('returns false for short password', () => {
      expect(isStrongPassword('Short1!')).toBe(false);
    });

    it('returns false for password without uppercase', () => {
      expect(isStrongPassword('lowercase1!')).toBe(false);
    });

    it('returns false for password without number', () => {
      expect(isStrongPassword('NoNumber!abc')).toBe(false);
    });

    it('returns false for password without symbol', () => {
      expect(isStrongPassword('NoSymbol123')).toBe(false);
    });
  });
});
