import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUser as CurrentUserType } from '../../common';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('rat-master/excel')
  @Roles('SUPER_ADMIN', 'DPO', 'SECURITY_LEAD', 'AUDITOR')
  async downloadRatMasterExcel(
    @Query('companyId') companyId: string,
    @CurrentUser() currentUser: CurrentUserType,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.generateRatMasterExcel(currentUser, companyId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="RAT_Maestro.xlsx"');
    res.send(buffer);
  }

  @Get('rat-master/pdf')
  @Roles('SUPER_ADMIN', 'DPO', 'SECURITY_LEAD', 'AUDITOR')
  async downloadRatMasterPdf(
    @Query('companyId') companyId: string,
    @CurrentUser() currentUser: CurrentUserType,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.generateRatMasterPdf(currentUser, companyId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="RAT_Maestro.pdf"');
    res.send(buffer);
  }

  @Get('kpis')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO', 'LEGAL_REVIEWER', 'PROCESS_LEADER', 'AUDITOR', 'SECURITY_LEAD', 'SUPPORT')
  async getKpis(@Query('companyId') companyId: string, @CurrentUser() currentUser: CurrentUserType) {
    return this.reportsService.getKpis(currentUser, companyId);
  }
}
