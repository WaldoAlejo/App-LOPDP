import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AreasService } from './areas.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUser as CurrentUserType } from '../../common';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Controller('areas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AreasController {
  constructor(private areasService: AreasService) {}

  @Get()
  findAll(
    @CurrentUser() currentUser: CurrentUserType,
    @Query('companyId') companyId?: string,
  ) {
    const filterCompanyId = currentUser.roleCode === 'SUPER_ADMIN' ? companyId : currentUser.companyId;
    return this.areasService.findAll(filterCompanyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: CurrentUserType) {
    return this.areasService.findOne(id, currentUser);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO')
  create(@Body() dto: CreateAreaDto, @CurrentUser() currentUser: CurrentUserType) {
    if (currentUser.roleCode !== 'SUPER_ADMIN') {
      (dto as CreateAreaDto & { companyId?: string }).companyId = currentUser.companyId!;
    }
    return this.areasService.create(dto);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO')
  update(@Param('id') id: string, @Body() dto: UpdateAreaDto) {
    return this.areasService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO')
  toggleStatus(@Param('id') id: string) {
    return this.areasService.toggleStatus(id);
  }
}
