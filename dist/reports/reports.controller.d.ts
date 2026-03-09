import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getAttendanceReports(eventId: string, status?: string, department?: string, date?: string): {
        records: ({
            id: string;
            name: string;
            role: string;
            dept: string;
            status: string;
            time: string;
        } | {
            id: string;
            name: string;
            role: string;
            dept: string;
            status: string;
            time: null;
        })[];
        totalRecords: number;
    };
    getSummary(eventId: string): {
        total: number;
        present: number;
        late: number;
        absent: number;
        attendanceRate: number;
    };
    getByDepartment(eventId: string): any;
    exportPDF(eventId: string): {
        success: boolean;
        message: string;
        fileName: string;
    };
    exportCSV(eventId: string): {
        success: boolean;
        message: string;
        fileName: string;
    };
}
