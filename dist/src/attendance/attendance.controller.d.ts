import { AttendanceService } from './attendance.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    getAttendanceOverview(eventId: string): Promise<{
        totalVolunteers: number;
        checkedIn: number;
        lateArrivals: number;
        absent: number;
        attendanceRate: number;
    }>;
    getVolunteerRoster(eventId: string): Promise<{
        id: string;
        name: string;
        role: string;
        status: string;
        checkedInTime: string | null;
    }[]>;
    checkIn(eventId: string, createCheckInDto: CreateCheckInDto): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
    }>;
    checkInByPin(eventId: string, pin: string): Promise<{
        success: boolean;
        message: string;
        volunteerName: string;
        timestamp: string;
    }>;
    getRecentCheckIns(eventId: string): Promise<{
        id: string;
        name: string;
        time: string;
        status: string;
    }[]>;
    getVolunteerCount(): Promise<number>;
}
