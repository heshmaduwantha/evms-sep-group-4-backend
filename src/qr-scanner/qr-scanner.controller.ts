import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { QrScannerService } from './qr-scanner.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/role.enum';

@Controller('qr-scanner')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QrScannerController {
  constructor(private readonly qrScannerService: QrScannerService) {}

  @Post('process-scan')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  processScan(@Body() data: { qrCode: string; eventId: string }) {
    return this.qrScannerService.processScan(data.qrCode, data.eventId);
  }

  @Get('session-stats/:eventId')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  getSessionStats(@Param('eventId') eventId: string) {
    return this.qrScannerService.getSessionStats(eventId);
  }

  @Get('recent-scans/:eventId')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  getRecentScans(@Param('eventId') eventId: string) {
    return this.qrScannerService.getRecentScans(eventId);
  }
}
