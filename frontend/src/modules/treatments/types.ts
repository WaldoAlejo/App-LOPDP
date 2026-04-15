export interface WizardTreatment {
  // Paso 1 - Identificación
  companyId: string;
  areaId: string;
  processId: string;
  code: string;
  name: string;
  shortDescription?: string;

  // Paso 2 - Finalidad
  mainPurpose: string;
  secondaryPurposes?: string;
  originOfData?: string;
  dataCollectionChannel?: string;
  approximateVolume?: string;
  processingFrequency?: string;

  // Paso 3 - Titulares
  dataSubjects: {
    dataSubjectTypeId: string;
    approximateCount?: string;
    sourceType?: string;
    relationshipWithCompany?: string;
    notes?: string;
  }[];

  // Paso 4 - Datos personales
  dataItems: {
    dataItemId: string;
    isRequired: boolean;
    isOptional: boolean;
    sourceDirectOrIndirect?: string;
    notes?: string;
  }[];

  // Paso 5 - Base legal
  legalBases: {
    legalBasisId: string;
    justification?: string;
    isMainBasis: boolean;
  }[];

  // Paso 6 - Sistemas y tecnologías
  captureSystem?: string;
  storageSystem?: string;
  medium?: string;
  technologies?: string;
  linkedDocuments?: string;
  applications?: string;

  // Paso 7 - Terceros
  hasThirdParties: boolean;
  thirdParties: {
    thirdPartyId: string;
    accessPurpose?: string;
    accessedDataDescription?: string;
    involvedDataSubjects?: string;
    transferOutsideCountry: boolean;
    notes?: string;
  }[];

  // Paso 8 - Transferencias internacionales
  hasInternationalTransfers: boolean;
  internationalTransfers: {
    countryId: string;
    thirdPartyId?: string;
    destinationName?: string;
    transferredDataDescription?: string;
    purpose?: string;
    transferLegalBasis?: string;
    safeguards?: string;
    notes?: string;
  }[];

  // Paso 9 - Conservación
  retention: {
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

  // Paso 10 - Medidas de seguridad
  securityMeasures: {
    securityMeasureId: string;
    implemented: boolean;
    evidence?: string;
    criticality?: string;
    notes?: string;
  }[];

  // Paso 11 - Ciclo de vida
  lifecycle: {
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

  // Paso 12 - Evaluación de riesgo
  riskAssessment: {
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

  // Flags
  automatedProcessing: boolean;
  profiling: boolean;
  automatedDecisions: boolean;
  usesAi: boolean;
  largeScaleProcessing: boolean;
  internationalTransfer: boolean;
}
