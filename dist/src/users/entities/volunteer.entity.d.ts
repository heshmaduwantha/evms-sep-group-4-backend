import { Attendance } from '../../attendance/entities/attendance.entity';
export declare class Volunteer {
    id: string;
    name: string;
    role: string;
    department: string;
    pin: string;
    attendances: Attendance[];
    createdAt: Date;
    updatedAt: Date;
}
