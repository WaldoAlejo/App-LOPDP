import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('audits')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO', 'AUDITOR')
  async findAll(
    @CurrentUser() currentUser: any,
    @Query('userId') userId?: string,
    @Query('entityName') entityName?: string,
    @Query('action') action?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const companyId = currentUser.role === 'SUPER_ADMIN' ? undefined : currentUser.companyId;
    return this.auditService.findMany({
      companyId,
      userId,
      entityName,
      action,
      startDate,
      endDate,
      skip: skip ? parseInt(skip, 10) : 0,
      take: take ? parseInt(take, 10) : 20,
    });
  }
}
