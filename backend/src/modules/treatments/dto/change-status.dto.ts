import { IsString, IsOptional } from 'class-validator';

export class ChangeStatusDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
