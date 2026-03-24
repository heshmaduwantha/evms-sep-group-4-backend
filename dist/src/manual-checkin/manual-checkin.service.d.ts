import { Repository } from 'typeorm';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Volunteer } from '../users/entities/volunteer.entity';
import { Application } from '../applications/entities/application.entity';
export declare class ManualCheckinService {
    private volunteerRepository;
    private attendanceRepository;
    private applicationRepository;
    constructor(volunteerRepository: Repository<Volunteer>, attendanceRepository: Repository<Attendance>, applicationRepository: Repository<Application>);
    getVolunteers(eventId: string, search?: string, status?: string): Promise<{
        volunteers: any[];
        total: number;
        checkedIn: number;
    }>;
    getCheckinSummary(eventId: string): Promise<{
        total: number;
        checkedIn: number;
        absent: number;
        percentage: number;
    }>;
    updateCheckin(volunteerId: string, eventId: string, updateCheckinDto: any): Promise<{
        success: boolean;
        volunteer: {
            id: string;
            name: string;
            checkedIn: any;
            time: string | null;
        };
    }>;
    markAbsent(volunteerId: string, eventId: string): Promise<{
        success: boolean;
        volunteer: {
            id: string;
            name: string;
            checkedIn: any;
            time: string | null;
        };
    }>;
    updateVolunteer(id: string, updateDto: any): Promise<Volunteer>;
    deleteVolunteer(id: string): Promise<{
        success: boolean;
    }>;
    createAttendance(eventId: string, createAttendanceDto: any): Promise<{
        success: boolean;
        volunteer: {
            id: string;
            name: string;
            role: string;
            checkedIn: any;
            time: string | null;
        };
    }>;
}
