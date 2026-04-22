import { IsString, IsOptional, IsObject } from 'class-validator';

export class SuggestDto {
  @IsString()
  field: string;

  @IsString()
  @IsOptional()
  treatmentName?: string;

  @IsString()
  @IsOptional()
  mainPurpose?: string;

  @IsString()
  @IsOptional()
  currentValue?: string;

  @IsObject()
  @IsOptional()
  context?: Record<string, any>;
}

export class ValidateDto {
  @IsObject()
  treatment: Record<string, any>;
}

export class ChatDto {
  @IsString()
  message: string;

  @IsObject()
  @IsOptional()
  context?: Record<string, any>;
}
