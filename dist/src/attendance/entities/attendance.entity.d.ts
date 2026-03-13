import { Volunteer } from '../../users/entities/volunteer.entity';
export declare class Attendance {
    id: string;
    eventId: string;
    volunteer: Volunteer;
    status: string;
    checkInTime: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
