import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TreatmentsService } from './treatments.service';
import { RiskAssessmentService } from './risk-assessment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUser as CurrentUserType } from '../../common';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { EvaluateRiskDto } from './dto/evaluate-risk.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('treatments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TreatmentsController {
  constructor(
    private treatmentsService: TreatmentsService,
    private riskService: RiskAssessmentService,
  ) {}

  @Get()
  findAll(
    @CurrentUser() currentUser: CurrentUserType,
    @Query() query: PaginationDto,
    @Query('companyId') companyId?: string,
    @Query('areaId') areaId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.treatmentsService.findAll(currentUser, { companyId, areaId, status, search, page: query.page, limit: query.limit });
  }

  @Get('code-preview')
  getCodePreview(
    @CurrentUser() currentUser: CurrentUserType,
    @Query('areaId') areaId?: string,
    @Query('processId') processId?: string,
    @Query('treatmentId') treatmentId?: string,
  ) {
    return this.treatmentsService.getCodePreview(currentUser, { areaId, processId, treatmentId });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: CurrentUserType) {
    return this.treatmentsService.findOne(id, currentUser);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO', 'PROCESS_LEADER', 'SUPPORT', 'AUDITOR', 'SECURITY_LEAD')
  create(@Body() dto: CreateTreatmentDto, @CurrentUser() currentUser: CurrentUserType) {
    return this.treatmentsService.create(dto, currentUser);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO', 'PROCESS_LEADER', 'SUPPORT', 'AUDITOR', 'SECURITY_LEAD')
  update(@Param('id') id: string, @Body() dto: UpdateTreatmentDto, @CurrentUser() currentUser: CurrentUserType) {
    return this.treatmentsService.update(id, dto, currentUser);
  }

  @Post(':id/status')
  changeStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto, @CurrentUser() currentUser: CurrentUserType) {
    return this.treatmentsService.changeStatus(id, dto, currentUser);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO', 'PROCESS_LEADER')
  delete(@Param('id') id: string, @CurrentUser() currentUser: CurrentUserType) {
    return this.treatmentsService.delete(id, currentUser);
  }

  @Post(':id/evaluate-risk')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO', 'LEGAL_REVIEWER')
  evaluateRisk(@Param('id') id: string, @Body() dto: EvaluateRiskDto) {
    return this.riskService.evaluate(id, dto as any);
  }

  @Get(':id/risk')
  getRisk(@Param('id') id: string) {
    return this.riskService.getByTreatment(id);
  }
}
