import { api } from './api';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

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
  captureSystem?: string;
  storageSystem?: string;
  medium?: string;
  technologies?: string;
  linkedDocuments?: string;
  applications?: string;
  automatedProcessing: boolean;
  profiling: boolean;
  profilingDescription?: string;
  automatedDecisions: boolean;
  automatedDecisionsDescription?: string;
  automatedDecisionsLogic?: string;
  automatedDecisionsConsequences?: string;
  humanInterventionAvailable: boolean;
  usesAi: boolean;
  aiSystemDescription?: string;
  largeScaleProcessing: boolean;
  internationalTransfer: boolean;
  treatmentResponsibleUserId?: string;
  dpoId?: string;
  dpoName?: string;
  dpoContactEmail?: string;
  dpoContactPhone?: string;
  jointControllerId?: string;
  jointControllerName?: string;
  jointControllerContact?: string;
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
  company?: { id: string; legalName: string; ruc?: string; address?: string; email?: string; phone?: string };
  area?: { id: string; name: string };
  process?: { id: string; name: string };
  observations?: { id: string; status: string }[];
  dataSubjects?: any[];
  treatmentDataItems?: any[];
  treatmentLegalBases?: any[];
  treatmentThirdParties?: any[];
  internationalTransfers?: any[];
  treatmentRetention?: {
    retentionRuleId?: string;
    retentionRule?: { name?: string };
    activeRetentionPeriod?: string;
    retentionCriteria?: string;
    legalOrContractualBasis?: string;
    blockingApplies: boolean;
    anonymizationApplies: boolean;
    deletionApplies: boolean;
    deletionMethod?: string;
    reviewFrequency?: string;
    responsibleRole?: string;
    notes?: string;
  };
  treatmentSecurityMeasures?: any[];
  lifecyclePhases?: any[];
  riskAssessment?: {
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
  };
}

export interface CreateTreatmentDto {
  companyId: string;
  areaId: string;
  processId: string;
  code?: string;
  name: string;
  shortDescription?: string;
  mainPurpose: string;
  secondaryPurposes?: string;
  originOfData?: string;
  dataCollectionChannel?: string;
  approximateVolume?: string;
  processingFrequency?: string;
  captureSystem?: string;
  storageSystem?: string;
  medium?: string;
  technologies?: string;
  linkedDocuments?: string;
  applications?: string;
  treatmentResponsibleUserId?: string;
  dpoId?: string;
  dpoName?: string;
  dpoContactEmail?: string;
  dpoContactPhone?: string;
  jointControllerId?: string;
  jointControllerName?: string;
  jointControllerContact?: string;
  automatedProcessing?: boolean;
  profiling?: boolean;
  profilingDescription?: string;
  automatedDecisions?: boolean;
  automatedDecisionsDescription?: string;
  automatedDecisionsLogic?: string;
  automatedDecisionsConsequences?: string;
  humanInterventionAvailable?: boolean;
  usesAi?: boolean;
  aiSystemDescription?: string;
  largeScaleProcessing?: boolean;
  internationalTransfer?: boolean;
  draftLegalBasisId?: string;
  dataSubjects?: {
    dataSubjectTypeId: string;
    approximateCount?: string;
    sourceType?: string;
    relationshipWithCompany?: string;
    notes?: string;
  }[];
  dataItems?: {
    dataItemId: string;
    isRequired: boolean;
    isOptional: boolean;
    sourceDirectOrIndirect?: string;
    notes?: string;
  }[];
  legalBases?: {
    legalBasisId: string;
    justification?: string;
    isMainBasis: boolean;
  }[];
  retention?: {
    retentionRuleId?: string;
    activeRetentionPeriod?: string;
    retentionCriteria?: string;
    legalOrContractualBasis?: string;
    blockingApplies: boolean;
    anonymizationApplies: boolean;
    deletionApplies: boolean;
    deletionMethod?: string;
    reviewFrequency?: string;
    responsibleRole?: string;
    notes?: string;
  };
  securityMeasures?: {
    securityMeasureId: string;
    implemented: boolean;
    evidence?: string;
    criticality?: string;
    notes?: string;
  }[];
  thirdParties?: {
    thirdPartyId: string;
    accessPurpose?: string;
    accessedDataDescription?: string;
    involvedDataSubjects?: string;
    transferOutsideCountry: boolean;
    notes?: string;
  }[];
  internationalTransfers?: {
    countryId: string;
    thirdPartyId?: string;
    destinationName?: string;
    transferredDataDescription?: string;
    purpose?: string;
    transferLegalBasis?: string;
    safeguards?: string;
    notes?: string;
  }[];
  lifecycle?: {
    lifecyclePhaseId: string;
    activityDescription?: string;
    processedDataDescription?: string;
    participants?: string;
    mediumOrSupport?: string;
    technologies?: string;
    linkedDocuments?: string;
    securityMeasuresByPhase?: string;
    risksByPhase?: string;
  }[];
  riskAssessment?: {
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
  };
}

export interface TreatmentCodePreview {
  code: string;
  areaSegment: string;
  processSegment: string;
  sequence: number;
}

function extractTreatments(payload: Treatment[] | PaginatedResponse<Treatment>): Treatment[] {
  return Array.isArray(payload) ? payload : payload.data;
}

export const treatmentService = {
  getAll: (params?: { companyId?: string; areaId?: string; status?: string; search?: string }) =>
    api.get<Treatment[] | PaginatedResponse<Treatment>>('/treatments', { params }).then(r => extractTreatments(r.data)),
  getCodePreview: (params: { areaId: string; processId: string; treatmentId?: string }) =>
    api.get<TreatmentCodePreview>('/treatments/code-preview', { params }).then(r => r.data),
  getOne: (id: string) => api.get<Treatment>(`/treatments/${id}`).then(r => r.data),
  create: (dto: CreateTreatmentDto) => api.post<Treatment>('/treatments', dto).then(r => r.data),
  update: (id: string, dto: Partial<CreateTreatmentDto>) => api.patch<Treatment>(`/treatments/${id}`, dto).then(r => r.data),
  changeStatus: (id: string, status: string, comment?: string) =>
    api.post<Treatment>(`/treatments/${id}/status`, { status, comment }).then(r => r.data),
  delete: (id: string) => api.delete(`/treatments/${id}`),
};
