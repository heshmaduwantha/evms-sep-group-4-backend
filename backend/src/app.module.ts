import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Abc@1234',
      database: 'evms_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    EventsModule,
  ],
})
export class AppModule {}