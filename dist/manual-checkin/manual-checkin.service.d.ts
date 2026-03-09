export declare class ManualCheckinService {
    private volunteers;
    getVolunteers(eventId: string, search?: string, status?: string): {
        volunteers: ({
            id: string;
            name: string;
            role: string;
            department: string;
            checkedIn: boolean;
            time: string;
        } | {
            id: string;
            name: string;
            role: string;
            department: string;
            checkedIn: boolean;
            time: null;
        })[];
        total: number;
        checkedIn: number;
    };
    getCheckinSummary(eventId: string): {
        total: number;
        checkedIn: number;
        absent: number;
        percentage: number;
    };
    updateCheckin(volunteerId: string, updateCheckinDto: any): {
        success: boolean;
        volunteer: {
            id: string;
            name: string;
            role: string;
            department: string;
            checkedIn: boolean;
            time: string;
        } | {
            id: string;
            name: string;
            role: string;
            department: string;
            checkedIn: boolean;
            time: null;
        } | undefined;
    };
    markAbsent(volunteerId: string): {
        success: boolean;
        volunteer: {
            id: string;
            name: string;
            role: string;
            department: string;
            checkedIn: boolean;
            time: string;
        } | {
            id: string;
            name: string;
            role: string;
            department: string;
            checkedIn: boolean;
            time: null;
        } | undefined;
    };
    createAttendance(createAttendanceDto: any): {
        success: boolean;
        volunteer: {
            id: string;
            name: any;
            role: any;
            department: any;
            checkedIn: any;
            time: any;
        };
    };
}
