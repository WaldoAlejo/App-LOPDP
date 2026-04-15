import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RiskFactors {
  usesSpecialCategories: boolean;
  involvesChildren: boolean;
  largeScale: boolean;
  systematicMonitoring: boolean;
  profiling: boolean;
  automatedDecisions: boolean;
  videoSurveillance: boolean;
  geolocation: boolean;
  biometricData: boolean;
  healthData: boolean;
  criminalData: boolean;
  crossBorderTransfer: boolean;
  potentialHighImpact: boolean;
}

export interface RiskResult {
  level: 'bajo' | 'medio' | 'alto' | 'critico';
  highRiskFlag: boolean;
  requiresDpia: boolean;
  factors: string[];
}

@Injectable()
export class RiskAssessmentService {
  constructor(private prisma: PrismaService) {}

  async evaluate(treatmentId: string, factors: RiskFactors): Promise<RiskResult> {
    let score = 0;
    const activeFactors: string[] = [];

    const checks: { key: keyof RiskFactors; label: string; weight: number }[] = [
      { key: 'usesSpecialCategories', label: 'Datos especiales', weight: 3 },
      { key: 'involvesChildren', label: 'Menores de edad', weight: 3 },
      { key: 'biometricData', label: 'Datos biométricos', weight: 3 },
      { key: 'healthData', label: 'Datos de salud', weight: 3 },
      { key: 'criminalData', label: 'Datos judiciales', weight: 3 },
      { key: 'automatedDecisions', label: 'Decisiones automatizadas', weight: 4 },
      { key: 'systematicMonitoring', label: 'Monitoreo sistemático', weight: 3 },
      { key: 'profiling', label: 'Perfilamiento', weight: 2 },
      { key: 'videoSurveillance', label: 'Videovigilancia', weight: 2 },
      { key: 'geolocation', label: 'Geolocalización', weight: 1 },
      { key: 'largeScale', label: 'Gran escala', weight: 2 },
      { key: 'crossBorderTransfer', label: 'Transferencia transfronteriza', weight: 2 },
      { key: 'potentialHighImpact', label: 'Alto impacto potencial', weight: 3 },
    ];

    for (const check of checks) {
      if (factors[check.key]) {
        score += check.weight;
        activeFactors.push(check.label);
      }
    }

    const level: RiskResult['level'] =
      score >= 8 ? 'critico' : score >= 5 ? 'alto' : score >= 2 ? 'medio' : 'bajo';

    const highRiskFlag = score >= 5;

    // EIPD requerido según criterios de la LOPDP
    const requiresDpia =
      (factors.usesSpecialCategories && factors.largeScale) ||
      factors.automatedDecisions ||
      factors.systematicMonitoring ||
      factors.potentialHighImpact ||
      (factors.biometricData && factors.largeScale) ||
      (factors.healthData && factors.largeScale) ||
      score >= 8;

    // Guardar o actualizar evaluación
    await this.prisma.riskAssessment.upsert({
      where: { treatmentId },
      update: {
        usesSpecialCategories: factors.usesSpecialCategories,
        involvesChildren: factors.involvesChildren,
        largeScale: factors.largeScale,
        systematicMonitoring: factors.systematicMonitoring,
        profiling: factors.profiling,
        automatedDecisions: factors.automatedDecisions,
        videoSurveillance: factors.videoSurveillance,
        geolocation: factors.geolocation,
        biometricData: factors.biometricData,
        healthData: factors.healthData,
        criminalData: factors.criminalData,
        crossBorderTransfer: factors.crossBorderTransfer,
        potentialHighImpact: factors.potentialHighImpact,
        highRiskFlag,
        requiresDpia,
      },
      create: {
        treatmentId,
        usesSpecialCategories: factors.usesSpecialCategories,
        involvesChildren: factors.involvesChildren,
        largeScale: factors.largeScale,
        systematicMonitoring: factors.systematicMonitoring,
        profiling: factors.profiling,
        automatedDecisions: factors.automatedDecisions,
        videoSurveillance: factors.videoSurveillance,
        geolocation: factors.geolocation,
        biometricData: factors.biometricData,
        healthData: factors.healthData,
        criminalData: factors.criminalData,
        crossBorderTransfer: factors.crossBorderTransfer,
        potentialHighImpact: factors.potentialHighImpact,
        highRiskFlag,
        requiresDpia,
      },
    });

    // Actualizar tratamiento
    await this.prisma.treatment.update({
      where: { id: treatmentId },
      data: {
        riskLevel: level,
        highRiskFlag,
        requiresDpia,
      },
    });

    return {
      level,
      highRiskFlag,
      requiresDpia,
      factors: activeFactors,
    };
  }

  async getByTreatment(treatmentId: string) {
    return this.prisma.riskAssessment.findUnique({
      where: { treatmentId },
    });
  }
}
