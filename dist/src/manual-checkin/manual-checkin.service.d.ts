import { Repository } from 'typeorm';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Volunteer } from '../users/entities/volunteer.entity';
export declare class ManualCheckinService {
    private volunteerRepository;
    private attendanceRepository;
    constructor(volunteerRepository: Repository<Volunteer>, attendanceRepository: Repository<Attendance>);
    getVolunteers(eventId: string, search?: string, status?: string): Promise<{
        volunteers: {
            id: string;
            name: string;
            role: string;
            department: string;
            qrCode: string;
            checkedIn: boolean;
            time: string | null;
        }[];
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
            department: string;
            checkedIn: any;
            time: string | null;
        };
    }>;
}
