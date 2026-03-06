import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/role.enum';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('overview/:eventId')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  getAttendanceOverview(@Param('eventId') eventId: string) {
    return this.attendanceService.getAttendanceOverview(eventId);
  }

  @Get('roster/:eventId')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  getVolunteerRoster(@Param('eventId') eventId: string) {
    return this.attendanceService.getVolunteerRoster(eventId);
  }

  @Post('check-in')
  @Roles(UserRole.VOLUNTEER, UserRole.ORGANIZER, UserRole.ADMIN)
  checkIn(@Body() createCheckInDto: CreateCheckInDto) {
    return this.attendanceService.checkIn(createCheckInDto);
  }

  @Get('recent-checkins/:eventId')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  getRecentCheckIns(@Param('eventId') eventId: string) {
    return this.attendanceService.getRecentCheckIns(eventId);
  }
}
