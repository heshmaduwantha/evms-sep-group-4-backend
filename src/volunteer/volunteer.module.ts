import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Volunteer } from '../users/entities/volunteer.entity';
import { VolunteerService } from './volunteer.service';
import { VolunteerController } from './volunteer.controller';

import { Application } from '../applications/entities/application.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Volunteer, Application, User])],
  controllers: [VolunteerController],
  providers: [VolunteerService],
})
export class VolunteerModule {}