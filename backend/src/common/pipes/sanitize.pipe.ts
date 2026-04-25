import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

/**
 * Sanitizes string inputs to prevent XSS attacks.
 * Removes potentially dangerous HTML/script content.
 */
@Injectable()
export class SanitizePipe implements PipeTransform {
  private readonly dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<\s*\/\s*script\s*>/gi,
  ];

  transform(value: any, metadata: ArgumentMetadata): any {
    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.transform(item, metadata));
    }

    if (value !== null && typeof value === 'object') {
      const sanitized: any = {};
      for (const key of Object.keys(value)) {
        sanitized[key] = this.transform(value[key], metadata);
      }
      return sanitized;
    }

    return value;
  }

  private sanitizeString(value: string): string {
    let sanitized = value;
    for (const pattern of this.dangerousPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }
    return sanitized.trim();
  }
}
