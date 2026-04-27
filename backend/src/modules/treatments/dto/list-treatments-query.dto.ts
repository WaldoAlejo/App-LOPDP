import { IsOptional, IsUUID, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class ListTreatmentsQueryDto extends PaginationDto {
  @IsOptional()
  @IsUUID('4', { message: 'companyId debe ser un UUID válido' })
  companyId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'areaId debe ser un UUID válido' })
  areaId?: string;

  @IsOptional()
  @MaxLength(200, { message: 'status no puede exceder 200 caracteres' })
  status?: string;
}