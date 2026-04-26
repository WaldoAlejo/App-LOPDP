import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';

/**
 * Sanitizes string inputs to prevent XSS attacks.
 * Uses sanitize-html library for robust HTML sanitization.
 * For non-HTML text fields, all HTML tags are stripped.
 */
@Injectable()
export class SanitizePipe implements PipeTransform {
  private readonly sanitizeOptions: sanitizeHtml.IOptions = {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  };

  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.transform(item, metadata));
    }

    if (value !== null && typeof value === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const key of Object.keys(value as Record<string, unknown>)) {
        sanitized[key] = this.transform((value as Record<string, unknown>)[key], metadata);
      }
      return sanitized;
    }

    return value;
  }

  private sanitizeString(value: string): string {
    // First trim whitespace
    const trimmed = value.trim();
    // Use sanitize-html to strip ALL HTML tags (allowedTags: [])
    // This prevents all XSS vectors including encoded, nested, and obfuscated payloads
    return sanitizeHtml(trimmed, this.sanitizeOptions);
  }
}
