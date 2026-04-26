import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUser as CurrentUserType } from '../../common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: CurrentUserType) {
    return this.companiesService.findOne(id, currentUser);
  }

  @Post()
  @Roles('SUPER_ADMIN')
  create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.create(dto);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO')
  update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.companiesService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN')
  toggleStatus(@Param('id') id: string) {
    return this.companiesService.toggleStatus(id);
  }
}
