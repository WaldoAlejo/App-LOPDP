import { IsString, IsUUID } from 'class-validator';

export class CreateObservationDto {
  @IsUUID()
  treatmentId: string;

  @IsString()
  sectionCode: string;

  @IsString()
  message: string;
}
