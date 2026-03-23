import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrScannerController } from './qr-scanner.controller';
import { QrScannerService } from './qr-scanner.service';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Volunteer } from '../users/entities/volunteer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, Volunteer])],
  controllers: [QrScannerController],
  providers: [QrScannerService],
  exports: [QrScannerService],
})
export class QrScannerModule {}
