import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ObservationsService } from './observations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateObservationDto } from './dto/create-observation.dto';

@Controller('observations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ObservationsController {
  constructor(private observationsService: ObservationsService) {}

  @Get('treatment/:treatmentId')
  findByTreatment(@Param('treatmentId') treatmentId: string) {
    return this.observationsService.findByTreatment(treatmentId);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO', 'LEGAL_REVIEWER')
  create(@Body() dto: CreateObservationDto, @CurrentUser() currentUser: any) {
    return this.observationsService.create(dto, currentUser);
  }

  @Patch(':id/resolve')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO', 'LEGAL_REVIEWER', 'PROCESS_LEADER')
  resolve(@Param('id') id: string) {
    return this.observationsService.resolve(id);
  }
}
