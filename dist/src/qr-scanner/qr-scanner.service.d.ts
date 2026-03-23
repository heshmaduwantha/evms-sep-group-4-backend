import { Repository } from 'typeorm';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Volunteer } from '../users/entities/volunteer.entity';
export declare class QrScannerService {
    private volunteerRepository;
    private attendanceRepository;
    constructor(volunteerRepository: Repository<Volunteer>, attendanceRepository: Repository<Attendance>);
    processScan(qrCode: string, eventId: string): Promise<{
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
