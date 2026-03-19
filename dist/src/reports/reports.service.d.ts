import { Repository } from 'typeorm';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Volunteer } from '../users/entities/volunteer.entity';
export declare class ReportsService {
    private volunteerRepository;
    private attendanceRepository;
    constructor(volunteerRepository: Repository<Volunteer>, attendanceRepository: Repository<Attendance>);
    getAttendanceReports(filters: any): Promise<{
        records: any[];
        totalRecords: number;
    }>;
    getSummary(eventId: string, date?: string): Promise<{
        total: number;
        present: number;
        late: number;
        absent: number;
        attendanceRate: number;
        manualCheckedIn: number;
    }>;
    getByDepartment(eventId: string, date?: string): Promise<any[]>;
    generatePDFReport(eventId: string, eventTitle?: string): Promise<{
        success: boolean;
        data: {
            reportName: string;
            generatedAt: string;
            summary: {
                total: number;
                present: number;
                late: number;
                absent: number;
                attendanceRate: number;
                manualCheckedIn: number;
            };
            records: any[];
        };
    }>;
    generateCSVReport(eventId: string, eventTitle?: string): Promise<{
        success: boolean;
        message: string;
        fileName: string;
        content: string;
    }>;
    getRawData(): Promise<{
        volunteers: Volunteer[];
        attendances: Attendance[];
    }>;
}
