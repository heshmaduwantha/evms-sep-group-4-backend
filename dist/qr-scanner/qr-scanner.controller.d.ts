import { QrScannerService } from './qr-scanner.service';
export declare class QrScannerController {
    private readonly qrScannerService;
    constructor(qrScannerService: QrScannerService);
    processScan(data: {
        qrCode: string;
        eventId: string;
    }): {
        success: boolean;
        message: string;
        scannedCount: any;
        volunteer?: undefined;
    } | {
        success: boolean;
        message: string;
        volunteer: {
            name: string;
        };
        scannedCount: any;
    };
    getSessionStats(eventId: string): any;
    getRecentScans(eventId: string): any;
}
