import { Controller, Get, Put, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ManualCheckinService } from './manual-checkin.service';
import { UpdateCheckinDto } from './dto/update-checkin.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/role.enum';

@Controller('manual-checkin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ManualCheckinController {
  constructor(private readonly manualCheckinService: ManualCheckinService) {}

  @Get('volunteers/:eventId')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  getVolunteers(
    @Param('eventId') eventId: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    console.log(`[ManualCheckinController] getVolunteers - eventId: ${eventId}, search: ${search}, status: ${status}`);
    return this.manualCheckinService.getVolunteers(eventId, search, status);
  }

  @Put('checkin/:eventId/:volunteerId')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  updateCheckin(
    @Param('eventId') eventId: string,
    @Param('volunteerId') volunteerId: string,
    @Body() updateCheckinDto: UpdateCheckinDto,
  ) {
    return this.manualCheckinService.updateCheckin(volunteerId, eventId, updateCheckinDto);
  }

  @Post('create/:eventId')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  createAttendance(
    @Param('eventId') eventId: string,
    @Body() createAttendanceDto: CreateAttendanceDto
  ) {
    console.log(`[ManualCheckinController] createAttendance - eventId: ${eventId}`, createAttendanceDto);
    return this.manualCheckinService.createAttendance(eventId, createAttendanceDto);
  }

  @Get('summary/:eventId')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  getCheckinSummary(@Param('eventId') eventId: string) {
    return this.manualCheckinService.getCheckinSummary(eventId);
  }

  @Put('mark-absent/:eventId/:volunteerId')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  markAbsent(
    @Param('eventId') eventId: string, 
    @Param('volunteerId') volunteerId: string
  ) {
    return this.manualCheckinService.markAbsent(volunteerId, eventId);
  }

  @Post('volunteer/:id')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  updateVolunteer(
    @Param('id') id: string,
    @Body() updateDto: any,
  ) {
    return this.manualCheckinService.updateVolunteer(id, updateDto);
  }

  @Delete('volunteer/:id')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  deleteVolunteer(@Param('id') id: string) {
    return this.manualCheckinService.deleteVolunteer(id);
  }
}
