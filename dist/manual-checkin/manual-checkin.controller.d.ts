import { ManualCheckinService } from './manual-checkin.service';
import { UpdateCheckinDto } from './dto/update-checkin.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
export declare class ManualCheckinController {
    private readonly manualCheckinService;
    constructor(manualCheckinService: ManualCheckinService);
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
    updateCheckin(volunteerId: string, updateCheckinDto: UpdateCheckinDto): {
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
    createAttendance(createAttendanceDto: CreateAttendanceDto): {
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
    getCheckinSummary(eventId: string): {
        total: number;
        checkedIn: number;
        absent: number;
        percentage: number;
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
}
