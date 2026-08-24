import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUser as CurrentUserType } from '../../common';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';

@Controller('catalogs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CatalogsController {
  constructor(private catalogsService: CatalogsService) {}

  @Get(':type')
  findAll(
    @Param('type') type: string,
    @CurrentUser() currentUser: CurrentUserType,
    @Query('companyId') companyId?: string,
  ) {
    const filterCompanyId = currentUser.roleCode === 'SUPER_ADMIN' ? companyId : currentUser.companyId;
    return this.catalogsService.findAll(type, filterCompanyId);
  }

  @Get(':type/:id')
  findOne(@Param('type') type: string, @Param('id') id: string) {
    return this.catalogsService.findOne(type, id);
  }

  @Post(':type')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO')
  create(@Param('type') type: string, @Body() dto: CreateCatalogItemDto, @CurrentUser() currentUser: CurrentUserType) {
    const globalCatalogs = ['third-party-types', 'countries'];
    if (currentUser.roleCode !== 'SUPER_ADMIN' && dto.companyId === undefined && !globalCatalogs.includes(type)) {
      (dto as CreateCatalogItemDto & { companyId?: string }).companyId = currentUser.companyId;
    }
    return this.catalogsService.create(type, dto);
  }

  @Patch(':type/:id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO')
  update(@Param('type') type: string, @Param('id') id: string, @Body() dto: UpdateCatalogItemDto) {
    return this.catalogsService.update(type, id, dto);
  }

  @Patch(':type/:id/status')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO')
  toggleStatus(@Param('type') type: string, @Param('id') id: string) {
    return this.catalogsService.toggleStatus(type, id);
  }
}
