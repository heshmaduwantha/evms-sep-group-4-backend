import { Volunteer } from '../../users/entities/volunteer.entity';
export declare class Attendance {
    id: string;
    eventId: string;
    volunteerId: string;
    volunteer: Volunteer;
    status: string;
    checkInTime: Date | null;
    checkInMethod: string;
    createdAt: Date;
    updatedAt: Date;
}
