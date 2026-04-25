/**
 * Security utilities for the frontend application
 */

/**
 * Sanitizes user input to prevent XSS attacks
 * Removes potentially dangerous HTML/script content
 */
export function sanitizeInput(input: string): string {
  if (!input) return input;
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML
    .replace(/&lt;script\b[^&]*&gt;[\s\S]*?&lt;\/script&gt;/gi, '')
    .replace(/&lt;iframe\b[^&]*&gt;[\s\S]*?&lt;\/iframe&gt;/gi, '')
    .replace(/&lt;object\b[^&]*&gt;[\s\S]*?&lt;\/object&gt;/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 * - Min 8 chars
 * - At least 1 uppercase
 * - At least 1 lowercase
 * - At least 1 number
 * - At least 1 symbol
 */
export function isStrongPassword(password: string): boolean {
  if (password.length < 8 || password.length > 128) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  if (!/[^A-Za-z0-9]/.test(password)) return false;
  return true;
}

/**
 * Gets password strength score (0-4)
 */
export function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

/**
 * Validates that a URL is safe (not javascript: or data:)
 */
export function isSafeUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase().trim();
  if (lower.startsWith('javascript:')) return false;
  if (lower.startsWith('data:')) return false;
  if (lower.startsWith('vbscript:')) return false;
  return true;
}

/**
 * Generates a cryptographically secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Checks if the application is running in a secure context (HTTPS)
 */
export function isSecureContext(): boolean {
  return window.isSecureContext;
}

/**
 * Logs security warnings to console in development
 */
export function checkSecurityContext(): void {
  if (import.meta.env.DEV) {
    if (!isSecureContext()) {
      console.warn('⚠️ La aplicación no está ejecutándose en un contexto seguro (HTTPS). Algunas funciones de seguridad pueden no estar disponibles.');
    }
  }
}
