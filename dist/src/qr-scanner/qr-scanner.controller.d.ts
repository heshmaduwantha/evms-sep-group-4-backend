import { QrScannerService } from './qr-scanner.service';
export declare class QrScannerController {
    private readonly qrScannerService;
    constructor(qrScannerService: QrScannerService);
    processScan(data: {
        qrCode: string;
        eventId: string;
    }): Promise<{
        success: boolean;
        message: string;
        scannedCount: number;
        volunteer?: undefined;
    } | {
        success: boolean;
        message: string;
        volunteer: {
            name: string;
        };
        scannedCount: number;
    }>;
    getSessionStats(eventId: string): Promise<{
        scanned: number;
        successRate: number;
    }>;
    getRecentScans(eventId: string): Promise<{
        id: string;
        volunteerId: string;
        name: string;
        time: string;
        status: string;
    }[]>;
}
