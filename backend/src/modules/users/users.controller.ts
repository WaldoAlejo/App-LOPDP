import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUser as CurrentUserType } from '../../common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll(
    @CurrentUser() currentUser: CurrentUserType,
    @Query('companyId') companyId?: string,
    @Query('areaId') areaId?: string,
    @Query('search') search?: string,
    @Query('roleCode') roleCode?: string,
  ) {
    return this.usersService.findAll(currentUser, { companyId, areaId, search, roleCode });
  }

  @Get('me')
  getMe(@CurrentUser() currentUser: CurrentUserType) {
    return this.usersService.findOne(currentUser.userId, currentUser);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: CurrentUserType) {
    return this.usersService.findOne(id, currentUser);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO')
  create(@Body() dto: CreateUserDto, @CurrentUser() currentUser: CurrentUserType) {
    return this.usersService.create(dto, currentUser);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() currentUser: CurrentUserType) {
    return this.usersService.update(id, dto, currentUser);
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO')
  toggleStatus(@Param('id') id: string, @CurrentUser() currentUser: CurrentUserType) {
    return this.usersService.toggleStatus(id, currentUser);
  }
}
