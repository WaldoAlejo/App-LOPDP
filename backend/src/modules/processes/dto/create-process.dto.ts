import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateProcessDto {
  @IsUUID()
  companyId: string;

  @IsUUID()
  areaId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  subProcess?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  businessObjective?: string;

  @IsOptional()
  @IsUUID()
  responsibleUserId?: string;

  @IsOptional()
  @IsString()
  criticality?: string;

  @IsOptional()
  isActive?: boolean;
}
