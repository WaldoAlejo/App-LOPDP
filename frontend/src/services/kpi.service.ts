import { api } from './api';

export interface KpiData {
  totalTreatments: number;
  pendingTreatments: number;
  approvedTreatments: number;
  rejectedOrArchived: number;
  highRiskTreatments: number;
  requiresDpia: number;
  dpiaCompleted: number;
  dpiaPending: number;
  underDpoReview: number;
  withOpenObservations: number;
  statusBreakdown: Record<string, number>;
  riskLevelBreakdown: Record<string, number>;
  topAreas: { areaId: string; areaName: string; count: number }[];
  recentActivity: { date: string; count: number }[];
}

export const kpiService = {
  getAll: (companyId?: string) =>
    api.get<KpiData>('/reports/kpis', { params: { companyId } }).then(r => r.data),
};
