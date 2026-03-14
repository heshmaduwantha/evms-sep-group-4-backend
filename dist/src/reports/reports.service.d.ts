import { Repository } from 'typeorm';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Volunteer } from '../users/entities/volunteer.entity';
export declare class ReportsService {
    private volunteerRepository;
    private attendanceRepository;
    constructor(volunteerRepository: Repository<Volunteer>, attendanceRepository: Repository<Attendance>);
    getAttendanceReports(filters: any): Promise<{
        records: {
            id: string;
            name: string;
            role: string;
            dept: string;
            status: string;
            time: string | null;
            method: string;
        }[];
        totalRecords: number;
    }>;
    getSummary(eventId: string, date?: string): Promise<{
        total: number;
        present: number;
        late: number;
        absent: number;
        attendanceRate: number;
        qrCheckedIn: number;
        manualCheckedIn: number;
    }>;
    getByDepartment(eventId: string, date?: string): Promise<any[]>;
    generatePDFReport(eventId: string): Promise<{
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
                qrCheckedIn: number;
                manualCheckedIn: number;
            };
            records: {
                id: string;
                name: string;
                role: string;
                dept: string;
                status: string;
                time: string | null;
                method: string;
            }[];
        };
    }>;
    generateCSVReport(eventId: string): Promise<{
        success: boolean;
        message: string;
        fileName: string;
        content: string;
    }>;
}
