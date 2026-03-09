export declare class ReportsService {
    private mockAttendanceRecords;
    private mockDepartmentData;
    getAttendanceReports(filters: any): {
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
    generatePDFReport(eventId: string): {
        success: boolean;
        message: string;
        fileName: string;
    };
    generateCSVReport(eventId: string): {
        success: boolean;
        message: string;
        fileName: string;
    };
}
