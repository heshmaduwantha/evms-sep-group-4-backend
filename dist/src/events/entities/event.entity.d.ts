import { User } from '../../users/entities/user.entity';
export declare enum EventStatus {
    UPCOMING = "upcoming",
    ACTIVE = "active",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class Event {
    id: string;
    title: string;
    description: string;
    date: Date;
    time: string;
    location: string;
    volunteersNeeded: number;
    status: EventStatus;
    organizer: User;
    volunteers: User[];
    createdAt: Date;
    updatedAt: Date;
}
