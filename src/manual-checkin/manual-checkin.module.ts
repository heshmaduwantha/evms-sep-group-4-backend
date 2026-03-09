import { Module } from '@nestjs/common';
import { ManualCheckinController } from './manual-checkin.controller';
import { ManualCheckinService } from './manual-checkin.service';

@Module({
  controllers: [ManualCheckinController],
  providers: [ManualCheckinService],
  exports: [ManualCheckinService],
})
export class ManualCheckinModule {}
