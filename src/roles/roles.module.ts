import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';
import { Application } from '../applications/entities/application.entity';

import { Volunteer } from '../users/entities/volunteer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Event, User, Application, Volunteer])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
