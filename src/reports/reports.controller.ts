import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/role.enum';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('attendance')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  getAttendanceReports(
    @Query('eventId') eventId: string,
    @Query('status') status?: string,
    @Query('department') department?: string,
    @Query('date') date?: string,
  ) {
    return this.reportsService.getAttendanceReports({
      eventId,
      status,
      department,
      date,
    });
  }

  @Get('summary')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  getSummary(@Query('eventId') eventId: string) {
    return this.reportsService.getSummary(eventId);
  }

  @Get('by-department')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  getByDepartment(@Query('eventId') eventId: string) {
    return this.reportsService.getByDepartment(eventId);
  }

  @Get('export/pdf')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  exportPDF(@Query('eventId') eventId: string) {
    return this.reportsService.generatePDFReport(eventId);
  }

  @Get('export/csv')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  exportCSV(@Query('eventId') eventId: string) {
    return this.reportsService.generateCSVReport(eventId);
  }
}
