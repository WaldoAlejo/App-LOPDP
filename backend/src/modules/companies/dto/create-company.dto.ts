import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  legalName: string;

  @IsOptional()
  @IsString()
  tradeName?: string;

  @IsString()
  ruc: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  economicActivity?: string;

  @IsOptional()
  @IsString()
  sector?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
