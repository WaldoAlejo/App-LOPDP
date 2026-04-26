import { describe, it, expect } from 'vitest';
import { sanitizePayload } from './sanitizePayload';

describe('sanitizePayload', () => {
  it('should sanitize strings in a flat object', () => {
    const input = { name: '<script>alert(1)</script>John', email: 'john@example.com' };
    const result = sanitizePayload(input);
    expect(result.name).not.toContain('<script>');
    expect(result.email).toBe('john@example.com');
  });

  it('should sanitize nested objects', () => {
    const input = {
      user: {
        firstName: '<iframe>bad</iframe>Alice',
        lastName: 'Smith',
      },
    };
    const result = sanitizePayload(input);
    expect(result.user.firstName).not.toContain('<iframe>');
    expect(result.user.lastName).toBe('Smith');
  });

  it('should sanitize arrays', () => {
    const input = {
      items: ['<object>evil</object>Item1', 'Item2'],
    };
    const result = sanitizePayload(input);
    expect(result.items[0]).not.toContain('<object>');
    expect(result.items[1]).toBe('Item2');
  });

  it('should preserve numbers, booleans, and null', () => {
    const input = {
      count: 42,
      active: true,
      empty: null,
      name: 'Safe',
    };
    const result = sanitizePayload(input);
    expect(result.count).toBe(42);
    expect(result.active).toBe(true);
    expect(result.empty).toBeNull();
    expect(result.name).toBe('Safe');
  });

  it('should handle deeply nested structures', () => {
    const input = {
      level1: {
        level2: {
          level3: {
            value: 'javascript:alert(1)',
          },
        },
      },
    };
    const result = sanitizePayload(input);
    expect(result.level1.level2.level3.value).not.toContain('javascript:');
  });
});
