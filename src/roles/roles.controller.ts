import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, AssignVolunteerDto } from './dto/role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/role.enum';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('dashboard')
  getDashboardStats() {
    return this.rolesService.getDashboardStats();
  }

  @Get('event/:eventId')
  getRolesByEvent(@Param('eventId') eventId: string) {
    return this.rolesService.getRolesByEvent(eventId);
  }

  @Get('event/:eventId/approved-volunteers')
  getApprovedVolunteers(@Param('eventId') eventId: string) {
    return this.rolesService.getApprovedVolunteersForEvent(eventId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  createRole(@Body() dto: CreateRoleDto) {
    return this.rolesService.createRole(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.updateRole(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }

  @Post(':id/assign')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  assignVolunteer(@Param('id') id: string, @Body() dto: AssignVolunteerDto) {
    return this.rolesService.assignVolunteer(id, dto.userId);
  }

  @Delete(':id/assign/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  removeVolunteer(@Param('id') id: string, @Param('userId') userId: string) {
    return this.rolesService.removeVolunteer(id, userId);
  }
}
