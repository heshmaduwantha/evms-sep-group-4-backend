import { ManualCheckinService } from './manual-checkin.service';
import { UpdateCheckinDto } from './dto/update-checkin.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
export declare class ManualCheckinController {
    private readonly manualCheckinService;
    constructor(manualCheckinService: ManualCheckinService);
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
    updateCheckin(eventId: string, volunteerId: string, updateCheckinDto: UpdateCheckinDto): Promise<{
        success: boolean;
        volunteer: {
            id: string;
            name: string;
            checkedIn: any;
            time: string | null;
        };
    }>;
    createAttendance(eventId: string, createAttendanceDto: CreateAttendanceDto): Promise<{
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
    getCheckinSummary(eventId: string): Promise<{
        total: number;
        checkedIn: number;
        absent: number;
        percentage: number;
    }>;
    markAbsent(eventId: string, volunteerId: string): Promise<{
        success: boolean;
        volunteer: {
            id: string;
            name: string;
            checkedIn: any;
            time: string | null;
        };
    }>;
    updateVolunteer(id: string, updateDto: any): Promise<import("../users/entities/volunteer.entity").Volunteer>;
    deleteVolunteer(id: string): Promise<{
        success: boolean;
    }>;
}
