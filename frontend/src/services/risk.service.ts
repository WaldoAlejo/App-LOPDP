import { api } from './api';

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

export const riskService = {
  evaluate: (treatmentId: string, dto: Partial<RiskFactors>) =>
    api.post<RiskResult>(`/treatments/${treatmentId}/evaluate-risk`, dto).then(r => r.data),
  getByTreatment: (treatmentId: string) =>
    api.get<RiskResult>(`/treatments/${treatmentId}/risk`).then(r => r.data),
};
