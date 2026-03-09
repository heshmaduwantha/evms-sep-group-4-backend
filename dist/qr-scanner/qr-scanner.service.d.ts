export declare class QrScannerService {
    private sessionStats;
    private recentScans;
    private volunteers;
    processScan(qrCode: string, eventId: string): {
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
