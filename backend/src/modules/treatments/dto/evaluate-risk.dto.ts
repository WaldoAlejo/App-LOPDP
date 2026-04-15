import { IsBoolean, IsOptional } from 'class-validator';

export class EvaluateRiskDto {
  @IsOptional()
  @IsBoolean()
  usesSpecialCategories?: boolean;

  @IsOptional()
  @IsBoolean()
  involvesChildren?: boolean;

  @IsOptional()
  @IsBoolean()
  largeScale?: boolean;

  @IsOptional()
  @IsBoolean()
  systematicMonitoring?: boolean;

  @IsOptional()
  @IsBoolean()
  profiling?: boolean;

  @IsOptional()
  @IsBoolean()
  automatedDecisions?: boolean;

  @IsOptional()
  @IsBoolean()
  videoSurveillance?: boolean;

  @IsOptional()
  @IsBoolean()
  geolocation?: boolean;

  @IsOptional()
  @IsBoolean()
  biometricData?: boolean;

  @IsOptional()
  @IsBoolean()
  healthData?: boolean;

  @IsOptional()
  @IsBoolean()
  criminalData?: boolean;

  @IsOptional()
  @IsBoolean()
  crossBorderTransfer?: boolean;

  @IsOptional()
  @IsBoolean()
  potentialHighImpact?: boolean;
}
