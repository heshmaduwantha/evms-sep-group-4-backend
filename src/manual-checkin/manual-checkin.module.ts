import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManualCheckinController } from './manual-checkin.controller';
import { ManualCheckinService } from './manual-checkin.service';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Volunteer } from '../users/entities/volunteer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, Volunteer])],
  controllers: [ManualCheckinController],
  providers: [ManualCheckinService],
  exports: [ManualCheckinService],
})
export class ManualCheckinModule {}
