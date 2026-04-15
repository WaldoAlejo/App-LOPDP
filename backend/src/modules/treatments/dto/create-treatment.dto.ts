import { IsString, IsOptional, IsUUID, IsBoolean, IsInt } from 'class-validator';

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
  @IsBoolean()
  automatedProcessing?: boolean;

  @IsOptional()
  @IsBoolean()
  profiling?: boolean;

  @IsOptional()
  @IsBoolean()
  automatedDecisions?: boolean;

  @IsOptional()
  @IsBoolean()
  usesAi?: boolean;

  @IsOptional()
  @IsBoolean()
  largeScaleProcessing?: boolean;

  @IsOptional()
  @IsBoolean()
  internationalTransfer?: boolean;

  @IsOptional()
  @IsUUID()
  draftLegalBasisId?: string;

  @IsOptional()
  @IsUUID()
  validatedLegalBasisId?: string;
}
