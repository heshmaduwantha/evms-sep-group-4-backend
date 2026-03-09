import { Module } from '@nestjs/common';
import { QrScannerController } from './qr-scanner.controller';
import { QrScannerService } from './qr-scanner.service';

@Module({
  controllers: [QrScannerController],
  providers: [QrScannerService],
  exports: [QrScannerService],
})
export class QrScannerModule {}
