export declare class AttendanceService {
    private mockAttendanceData;
    private mockRosterData;
    private mockRecentCheckIns;
    getAttendanceOverview(eventId: string): any;
    getVolunteerRoster(eventId: string): any;
    getRecentCheckIns(eventId: string): any;
    checkIn(data: any): {
        success: boolean;
        message: string;
        timestamp: string;
    };
}
