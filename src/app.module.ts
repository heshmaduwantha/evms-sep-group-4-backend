import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { Event } from './events/entities/event.entity';
import { EventsModule } from './events/events.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ManualCheckinModule } from './manual-checkin/manual-checkin.module';
import { ReportsModule } from './reports/reports.module';
import { Volunteer } from './users/entities/volunteer.entity';
import { Attendance } from './attendance/entities/attendance.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('PG_DB_HOST'),
        port: configService.get<number>('PG_DB_PORT'),
        username: configService.get<string>('PG_DB_USER'),
        password: configService.get<string>('PG_DB_PASSWORD'),
        database: configService.get<string>('PG_DB_NAME'),
        entities: [User, Event, Volunteer, Attendance],
        autoLoadEntities: true,
        synchronize: true, // Only for development!
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    EventsModule,
    AttendanceModule,
    ManualCheckinModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
