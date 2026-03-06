import { AttendanceService } from './attendance.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    getAttendanceOverview(eventId: string): any;
    getVolunteerRoster(eventId: string): any;
    checkIn(createCheckInDto: CreateCheckInDto): {
        success: boolean;
        message: string;
        timestamp: string;
    };
    getRecentCheckIns(eventId: string): any;
}
