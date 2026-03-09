import { Controller, Get, Put, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
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
    return this.manualCheckinService.getVolunteers(eventId, search, status);
  }

  @Put('checkin/:volunteerId')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  updateCheckin(
    @Param('volunteerId') volunteerId: string,
    @Body() updateCheckinDto: UpdateCheckinDto,
  ) {
    return this.manualCheckinService.updateCheckin(volunteerId, updateCheckinDto);
  }

  @Post('create')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  createAttendance(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.manualCheckinService.createAttendance(createAttendanceDto);
  }

  @Get('summary/:eventId')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  getCheckinSummary(@Param('eventId') eventId: string) {
    return this.manualCheckinService.getCheckinSummary(eventId);
  }

  @Put('mark-absent/:volunteerId')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  markAbsent(@Param('volunteerId') volunteerId: string) {
    return this.manualCheckinService.markAbsent(volunteerId);
  }
}
