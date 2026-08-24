import { IsString, IsOptional, IsBoolean, IsUUID, IsInt } from 'class-validator';

export class CreateCatalogItemDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Campos específicos por tipo de catálogo
  @IsOptional()
  @IsBoolean()
  isSpecialCategory?: boolean;

  @IsOptional()
  @IsString()
  legalReference?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  defaultTerm?: string;

  @IsOptional()
  @IsInt()
  orderIndex?: number;

  @IsOptional()
  @IsString()
  severity?: string;

  @IsOptional()
  @IsString()
  isoCode?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsUUID()
  dataCategoryId?: string;

  @IsOptional()
  @IsBoolean()
  isSensitive?: boolean;

  @IsOptional()
  @IsString()
  identificationNumber?: string;

  @IsOptional()
  @IsUUID()
  countryId?: string;

  @IsOptional()
  @IsUUID()
  thirdPartyTypeId?: string;

  @IsOptional()
  @IsString()
  legalAddress?: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsBoolean()
  actsAsProcessor?: boolean;

  @IsOptional()
  @IsBoolean()
  actsAsRecipient?: boolean;

  @IsOptional()
  @IsBoolean()
  actsAsJointController?: boolean;

  @IsOptional()
  @IsBoolean()
  contractExists?: boolean;

  @IsOptional()
  @IsBoolean()
  confidentialityAgreementExists?: boolean;

  @IsOptional()
  @IsBoolean()
  usesSubprocessors?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
