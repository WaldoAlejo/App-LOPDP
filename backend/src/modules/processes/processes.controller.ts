import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProcessesService } from './processes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUser as CurrentUserType } from '../../common';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';

@Controller('processes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProcessesController {
  constructor(private processesService: ProcessesService) {}

  @Get()
  findAll(
    @CurrentUser() currentUser: CurrentUserType,
    @Query('companyId') companyId?: string,
    @Query('areaId') areaId?: string,
  ) {
    const filterCompanyId = currentUser.roleCode === 'SUPER_ADMIN' ? companyId : currentUser.companyId;
    return this.processesService.findAll(filterCompanyId, areaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: CurrentUserType) {
    return this.processesService.findOne(id, currentUser);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO')
  create(@Body() dto: CreateProcessDto, @CurrentUser() currentUser: CurrentUserType) {
    if (currentUser.roleCode !== 'SUPER_ADMIN') {
      (dto as CreateProcessDto & { companyId?: string }).companyId = currentUser.companyId!;
    }
    return this.processesService.create(dto);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO')
  update(@Param('id') id: string, @Body() dto: UpdateProcessDto) {
    return this.processesService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO')
  toggleStatus(@Param('id') id: string) {
    return this.processesService.toggleStatus(id);
  }
}
