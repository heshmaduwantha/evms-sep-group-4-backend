import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getAttendanceReports(eventId: string, status?: string, department?: string, date?: string): Promise<{
        records: {
            id: string;
            name: string;
            role: string;
            dept: string;
            status: string;
            time: string | null;
        }[];
        totalRecords: number;
    }>;
    getSummary(eventId: string): Promise<{
        total: number;
        present: number;
        late: number;
        absent: number;
        attendanceRate: number;
    }>;
    getByDepartment(eventId: string): Promise<any[]>;
    exportPDF(eventId: string): Promise<{
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
            };
            records: {
                id: string;
                name: string;
                role: string;
                dept: string;
                status: string;
                time: string | null;
            }[];
        };
    }>;
    exportCSV(eventId: string): Promise<{
        success: boolean;
        message: string;
        fileName: string;
        content: string;
    }>;
}
