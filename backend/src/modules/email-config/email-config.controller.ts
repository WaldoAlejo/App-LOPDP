import { Controller, Get, Post, Delete, Body, Query, UseGuards } from '@nestjs/common';
import { EmailConfigService } from './email-config.service';
import type { EmailConfigDto } from './email-config.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('email-config')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmailConfigController {
  constructor(private emailConfigService: EmailConfigService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO')
  async getConfig(@CurrentUser() currentUser: any, @Query('companyId') companyId?: string) {
    return this.emailConfigService.getConfig(currentUser, companyId);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO')
  async upsertConfig(
    @CurrentUser() currentUser: any,
    @Body() dto: EmailConfigDto,
    @Query('companyId') companyId?: string,
  ) {
    return this.emailConfigService.upsertConfig(currentUser, dto, companyId);
  }

  @Post('test')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO')
  async testConfig(
    @CurrentUser() currentUser: any,
    @Body() dto: EmailConfigDto,
    @Query('companyId') companyId?: string,
  ) {
    return this.emailConfigService.testConfig(currentUser, dto, companyId);
  }

  @Delete()
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO')
  async deleteConfig(@CurrentUser() currentUser: any, @Query('companyId') companyId?: string) {
    await this.emailConfigService.deleteConfig(currentUser, companyId);
    return { message: 'Configuración eliminada' };
  }
}
