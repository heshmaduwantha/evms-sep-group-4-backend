import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Volunteer } from './entities/volunteer.entity';
import { SeedService } from './seed.service';
import { Event } from '../events/entities/event.entity';
import { Role } from '../roles/entities/role.entity';
import { Application } from '../applications/entities/application.entity';
import { Attendance } from '../attendance/entities/attendance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Volunteer, Event, Role, Application, Attendance])],
  providers: [UsersService, SeedService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule { }
