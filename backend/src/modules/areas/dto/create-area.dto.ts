import { IsString, IsOptional, IsUUID, IsBoolean } from 'class-validator';

export class CreateAreaDto {
  @IsUUID()
  companyId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  responsibleUserId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
