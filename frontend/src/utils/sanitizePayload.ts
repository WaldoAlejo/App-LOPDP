import { sanitizeInput } from './security';

/**
 * Recursively sanitizes string values in an object payload.
 * Used before sending data to the API to prevent XSS injection.
 */
export function sanitizePayload<T>(payload: T): T {
  if (typeof payload === 'string') {
    return sanitizeInput(payload) as unknown as T;
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizePayload(item)) as unknown as T;
  }

  if (payload !== null && typeof payload === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const key of Object.keys(payload)) {
      sanitized[key] = sanitizePayload((payload as Record<string, unknown>)[key]);
    }
    return sanitized as T;
  }

  return payload;
}
