import { api } from './api';

export interface Treatment {
  id: string;
  companyId: string;
  areaId: string;
  processId: string;
  code: string;
  version: number;
  name: string;
  shortDescription?: string;
  mainPurpose: string;
  secondaryPurposes?: string;
  originOfData?: string;
  dataCollectionChannel?: string;
  approximateVolume?: string;
  processingFrequency?: string;
  automatedProcessing: boolean;
  profiling: boolean;
  automatedDecisions: boolean;
  usesAi: boolean;
  largeScaleProcessing: boolean;
  internationalTransfer: boolean;
  draftLegalBasisId?: string;
  validatedLegalBasisId?: string;
  createdByUserId: string;
  reviewedByUserId?: string;
  currentStatus: string;
  submissionDate?: string;
  approvalDate?: string;
  riskLevel?: string;
  highRiskFlag: boolean;
  requiresDpia: boolean;
  dpiaStatus?: string;
  reviewDueDate?: string;
  createdAt: string;
  updatedAt: string;
  company?: { id: string; legalName: string };
  observations?: { id: string; status: string }[];
  dataSubjects?: any[];
  treatmentDataItems?: any[];
  treatmentLegalBases?: any[];
  riskAssessment?: {
    usesSpecialCategories: boolean;
    involvesChildren: boolean;
    biometricData: boolean;
    healthData: boolean;
    criminalData: boolean;
    automatedDecisions: boolean;
    systematicMonitoring: boolean;
    potentialHighImpact: boolean;
    largeScale: boolean;
  };
}

export interface CreateTreatmentDto {
  companyId: string;
  areaId: string;
  processId: string;
  code: string;
  name: string;
  shortDescription?: string;
  mainPurpose: string;
  secondaryPurposes?: string;
  originOfData?: string;
  dataCollectionChannel?: string;
  approximateVolume?: string;
  processingFrequency?: string;
  automatedProcessing?: boolean;
  profiling?: boolean;
  automatedDecisions?: boolean;
  usesAi?: boolean;
  largeScaleProcessing?: boolean;
  internationalTransfer?: boolean;
  draftLegalBasisId?: string;
}

export const treatmentService = {
  getAll: (params?: { companyId?: string; areaId?: string; status?: string; search?: string }) =>
    api.get<Treatment[]>('/treatments', { params }).then(r => r.data),
  getOne: (id: string) => api.get<Treatment>(`/treatments/${id}`).then(r => r.data),
  create: (dto: CreateTreatmentDto) => api.post<Treatment>('/treatments', dto).then(r => r.data),
  update: (id: string, dto: Partial<CreateTreatmentDto>) => api.patch<Treatment>(`/treatments/${id}`, dto).then(r => r.data),
  changeStatus: (id: string, status: string, comment?: string) =>
    api.post<Treatment>(`/treatments/${id}/status`, { status, comment }).then(r => r.data),
  delete: (id: string) => api.delete(`/treatments/${id}`),
};
