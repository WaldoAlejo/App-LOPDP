import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class TreatmentDataSubjectDto {
  @IsUUID()
  dataSubjectTypeId: string;

  @IsOptional()
  @IsString()
  approximateCount?: string;

  @IsOptional()
  @IsString()
  sourceType?: string;

  @IsOptional()
  @IsString()
  relationshipWithCompany?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class TreatmentDataItemDto {
  @IsUUID()
  dataItemId: string;

  @IsBoolean()
  isRequired: boolean;

  @IsBoolean()
  isOptional: boolean;

  @IsOptional()
  @IsString()
  sourceDirectOrIndirect?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class TreatmentLegalBasisDto {
  @IsUUID()
  legalBasisId: string;

  @IsOptional()
  @IsString()
  justification?: string;

  @IsBoolean()
  isMainBasis: boolean;
}

class TreatmentRetentionDto {
  @IsOptional()
  @IsUUID()
  retentionRuleId?: string;

  @IsOptional()
  @IsString()
  activeRetentionPeriod?: string;

  @IsOptional()
  @IsString()
  retentionCriteria?: string;

  @IsOptional()
  @IsString()
  legalOrContractualBasis?: string;

  @IsBoolean()
  blockingApplies: boolean;

  @IsBoolean()
  anonymizationApplies: boolean;

  @IsBoolean()
  deletionApplies: boolean;

  @IsOptional()
  @IsString()
  deletionMethod?: string;

  @IsOptional()
  @IsString()
  reviewFrequency?: string;

  @IsOptional()
  @IsString()
  responsibleRole?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class TreatmentSecurityMeasureDto {
  @IsUUID()
  securityMeasureId: string;

  @IsBoolean()
  implemented: boolean;

  @IsOptional()
  @IsString()
  evidence?: string;

  @IsOptional()
  @IsString()
  criticality?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class TreatmentThirdPartyDto {
  @IsUUID()
  thirdPartyId: string;

  @IsOptional()
  @IsString()
  accessPurpose?: string;

  @IsOptional()
  @IsString()
  accessedDataDescription?: string;

  @IsOptional()
  @IsString()
  involvedDataSubjects?: string;

  @IsBoolean()
  transferOutsideCountry: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

class InternationalTransferDto {
  @IsUUID()
  countryId: string;

  @IsOptional()
  @IsUUID()
  thirdPartyId?: string;

  @IsOptional()
  @IsString()
  destinationName?: string;

  @IsOptional()
  @IsString()
  transferredDataDescription?: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsString()
  transferLegalBasis?: string;

  @IsOptional()
  @IsString()
  safeguards?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class TreatmentLifecycleDto {
  @IsUUID()
  lifecyclePhaseId: string;

  @IsOptional()
  @IsString()
  activityDescription?: string;

  @IsOptional()
  @IsString()
  processedDataDescription?: string;

  @IsOptional()
  @IsString()
  participants?: string;

  @IsOptional()
  @IsString()
  mediumOrSupport?: string;

  @IsOptional()
  @IsString()
  technologies?: string;

  @IsOptional()
  @IsString()
  linkedDocuments?: string;

  @IsOptional()
  @IsString()
  securityMeasuresByPhase?: string;

  @IsOptional()
  @IsString()
  risksByPhase?: string;
}

class RiskAssessmentDto {
  @IsBoolean()
  usesSpecialCategories: boolean;

  @IsBoolean()
  involvesChildren: boolean;

  @IsBoolean()
  largeScale: boolean;

  @IsBoolean()
  systematicMonitoring: boolean;

  @IsBoolean()
  profiling: boolean;

  @IsBoolean()
  automatedDecisions: boolean;

  @IsBoolean()
  videoSurveillance: boolean;

  @IsBoolean()
  geolocation: boolean;

  @IsBoolean()
  biometricData: boolean;

  @IsBoolean()
  healthData: boolean;

  @IsBoolean()
  criminalData: boolean;

  @IsBoolean()
  crossBorderTransfer: boolean;

  @IsBoolean()
  potentialHighImpact: boolean;
}

export class CreateTreatmentDto {
  @IsUUID()
  companyId: string;

  @IsUUID()
  areaId: string;

  @IsUUID()
  processId: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsInt()
  version?: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsString()
  mainPurpose: string;

  @IsOptional()
  @IsString()
  secondaryPurposes?: string;

  @IsOptional()
  @IsString()
  originOfData?: string;

  @IsOptional()
  @IsString()
  dataCollectionChannel?: string;

  @IsOptional()
  @IsString()
  approximateVolume?: string;

  @IsOptional()
  @IsString()
  processingFrequency?: string;

  @IsOptional()
  @IsString()
  captureSystem?: string;

  @IsOptional()
  @IsString()
  storageSystem?: string;

  @IsOptional()
  @IsString()
  medium?: string;

  @IsOptional()
  @IsString()
  technologies?: string;

  @IsOptional()
  @IsString()
  linkedDocuments?: string;

  @IsOptional()
  @IsString()
  applications?: string;

  @IsOptional()
  @IsBoolean()
  automatedProcessing?: boolean;

  @IsOptional()
  @IsBoolean()
  profiling?: boolean;

  @IsOptional()
  @IsString()
  profilingDescription?: string;

  @IsOptional()
  @IsBoolean()
  automatedDecisions?: boolean;

  @IsOptional()
  @IsString()
  automatedDecisionsDescription?: string;

  @IsOptional()
  @IsString()
  automatedDecisionsLogic?: string;

  @IsOptional()
  @IsString()
  automatedDecisionsConsequences?: string;

  @IsOptional()
  @IsBoolean()
  humanInterventionAvailable?: boolean;

  @IsOptional()
  @IsBoolean()
  usesAi?: boolean;

  @IsOptional()
  @IsString()
  aiSystemDescription?: string;

  @IsOptional()
  @IsBoolean()
  largeScaleProcessing?: boolean;

  @IsOptional()
  @IsBoolean()
  internationalTransfer?: boolean;

  @IsOptional()
  @IsUUID()
  treatmentResponsibleUserId?: string;

  @IsOptional()
  @IsUUID()
  dpoId?: string;

  @IsOptional()
  @IsString()
  dpoName?: string;

  @IsOptional()
  @IsString()
  dpoContactEmail?: string;

  @IsOptional()
  @IsString()
  dpoContactPhone?: string;

  @IsOptional()
  @IsUUID()
  jointControllerId?: string;

  @IsOptional()
  @IsString()
  jointControllerName?: string;

  @IsOptional()
  @IsString()
  jointControllerContact?: string;

  @IsOptional()
  @IsUUID()
  draftLegalBasisId?: string;

  @IsOptional()
  @IsUUID()
  validatedLegalBasisId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TreatmentDataSubjectDto)
  dataSubjects?: TreatmentDataSubjectDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TreatmentDataItemDto)
  dataItems?: TreatmentDataItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TreatmentLegalBasisDto)
  legalBases?: TreatmentLegalBasisDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => TreatmentRetentionDto)
  retention?: TreatmentRetentionDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TreatmentSecurityMeasureDto)
  securityMeasures?: TreatmentSecurityMeasureDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TreatmentThirdPartyDto)
  thirdParties?: TreatmentThirdPartyDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InternationalTransferDto)
  internationalTransfers?: InternationalTransferDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TreatmentLifecycleDto)
  lifecycle?: TreatmentLifecycleDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => RiskAssessmentDto)
  riskAssessment?: RiskAssessmentDto;
}
