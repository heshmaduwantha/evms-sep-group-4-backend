import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManualCheckinController } from './manual-checkin.controller';
import { ManualCheckinService } from './manual-checkin.service';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Volunteer } from '../users/entities/volunteer.entity';
import { Application } from '../applications/entities/application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, Volunteer, Application])],
  controllers: [ManualCheckinController],
  providers: [ManualCheckinService],
  exports: [ManualCheckinService],
})
export class ManualCheckinModule {}
