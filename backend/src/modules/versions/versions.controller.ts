import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { VersionsService } from './versions.service';
import { TreatmentsService } from '../treatments/treatments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('versions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VersionsController {
  constructor(
    private versionsService: VersionsService,
    private treatmentsService: TreatmentsService,
  ) {}

  @Get('treatment/:treatmentId')
  findByTreatment(@Param('treatmentId') treatmentId: string) {
    return this.versionsService.findByTreatment(treatmentId);
  }

  @Post('treatment/:treatmentId')
  async create(
    @Param('treatmentId') treatmentId: string,
    @Body('changeReason') changeReason: string,
    @CurrentUser() currentUser: any,
  ) {
    const treatment = await this.treatmentsService.findOne(treatmentId, currentUser);
    return this.versionsService.create(treatmentId, treatment, changeReason || 'Cambio manual', currentUser);
  }
}
