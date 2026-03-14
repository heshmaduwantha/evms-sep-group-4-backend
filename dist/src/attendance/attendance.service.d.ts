import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { Volunteer } from '../users/entities/volunteer.entity';
import { CreateCheckInDto } from './dto/create-check-in.dto';
export declare class AttendanceService {
    private attendanceRepository;
    private volunteerRepository;
    constructor(attendanceRepository: Repository<Attendance>, volunteerRepository: Repository<Volunteer>);
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
    getRecentCheckIns(eventId: string): Promise<{
        id: string;
        name: string;
        time: string;
        status: string;
    }[]>;
    checkIn(createCheckInDto: CreateCheckInDto & {
        eventId: string;
    }): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
    }>;
    getVolunteerCount(): Promise<number>;
}
