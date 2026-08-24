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
    const sanitized = sanitizeHtml(trimmed, this.sanitizeOptions);
    // sanitize-html HTML-entity-encodes the remaining text (it assumes the output
    // will be rendered as HTML). Since all tags were already stripped above, decoding
    // entities here is safe and prevents plain text like "A & B" from being corrupted
    // to "A &amp; B" in storage.
    // Decode &amp; last so a literal "&lt;" the user typed doesn't get double-unescaped into "<".
    return sanitized
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#0*39;|&apos;/g, "'")
      .replace(/&amp;/g, '&');
  }
}
