import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Service responsible for generating RAT (Registro de Actividades de Tratamiento) codes.
 * Format: RAT-{AreaInitials}-{ProcessInitials}-{Sequence}
 */
@Injectable()
export class TreatmentCodeService {
  constructor(private prisma: PrismaService) {}

  /**
   * Normalizes a string for code generation by removing accents and special characters.
   */
  private normalizeCodeToken(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .toUpperCase();
  }

  /**
   * Extracts initials from a string for code segments.
   * - Single word: first 2 letters
   * - Multiple words: first letter of each word (up to 4)
   */
  private getInitials(value: string): string {
    const normalized = this.normalizeCodeToken(value);
    const words = normalized.split(/\s+/).filter((w) => w.length > 0);
    if (words.length === 0) return 'XX';
    if (words.length === 1) {
      const w = words[0];
      return w.length >= 2 ? w.slice(0, 2) : w.padEnd(2, 'X');
    }
    const initials = words.map((w) => w[0]).join('');
    return initials.slice(0, 4).padEnd(2, 'X');
  }

  /**
   * Extracts the numeric sequence from an existing code.
   */
  private extractCodeSequence(code: string, prefix: string): number {
    const match = code.match(new RegExp(`^${prefix}-(\\d+)$`));
    if (!match) return 0;
    return Number.parseInt(match[1], 10) || 0;
  }

  /**
   * Resolves the area and process context for code generation.
   * Validates that the area and process belong to the specified company.
   */
  private async resolveCodeContext(
    companyId: string,
    areaId: string,
    processId: string,
  ): Promise<{ areaSegment: string; processSegment: string; prefix: string }> {
    const [area, process] = await Promise.all([
      this.prisma.area.findUnique({
        where: { id: areaId },
        select: { id: true, companyId: true, name: true },
      }),
      this.prisma.process.findUnique({
        where: { id: processId },
        select: { id: true, companyId: true, areaId: true, name: true },
      }),
    ]);

    if (!area || area.companyId !== companyId) {
      throw new BadRequestException(
        'El área seleccionada no es válida para la empresa del tratamiento',
      );
    }

    if (!process || process.companyId !== companyId || process.areaId !== areaId) {
      throw new BadRequestException(
        'El proceso seleccionado no es válido para el área indicada',
      );
    }

    const areaSegment = this.getInitials(area.name);
    const processSegment = this.getInitials(process.name);
    const prefix = `RAT-${areaSegment}-${processSegment}`;

    return { areaSegment, processSegment, prefix };
  }

  /**
   * Generates a unique treatment code.
   * If a current treatment is provided and its area/process haven't changed,
   * preserves the existing code.
   */
  async generateCode(
    companyId: string,
    areaId: string,
    processId: string,
    currentTreatment?: {
      id: string;
      areaId: string;
      processId: string;
      code: string;
    },
  ): Promise<{
    code: string;
    areaSegment: string;
    processSegment: string;
    sequence: number;
  }> {
    const context = await this.resolveCodeContext(companyId, areaId, processId);

    if (
      currentTreatment &&
      currentTreatment.areaId === areaId &&
      currentTreatment.processId === processId &&
      currentTreatment.code.startsWith(`${context.prefix}-`)
    ) {
      return {
        code: currentTreatment.code,
        areaSegment: context.areaSegment,
        processSegment: context.processSegment,
        sequence: this.extractCodeSequence(currentTreatment.code, context.prefix),
      };
    }

    const treatmentsWithPrefix = await this.prisma.treatment.findMany({
      where: {
        companyId,
        code: { startsWith: `${context.prefix}-` },
        ...(currentTreatment ? { NOT: { id: currentTreatment.id } } : {}),
      },
      select: { code: true },
    });

    const nextSequence =
      treatmentsWithPrefix.reduce((maxSequence, treatment) => {
        return Math.max(
          maxSequence,
          this.extractCodeSequence(treatment.code, context.prefix),
        );
      }, 0) + 1;

    return {
      code: `${context.prefix}-${String(nextSequence).padStart(3, '0')}`,
      areaSegment: context.areaSegment,
      processSegment: context.processSegment,
      sequence: nextSequence,
    };
  }
}
