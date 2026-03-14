import { EventStatus } from '../entities/event.entity';
export declare class CreateEventDto {
    title: string;
    description?: string;
    date: Date;
    time: string;
    location: string;
    volunteersNeeded: number;
    status?: EventStatus;
    organizerId: string;
}
export declare class UpdateEventDto {
    title?: string;
    description?: string;
    date?: Date;
    time?: string;
    location?: string;
    volunteersNeeded?: number;
    status?: EventStatus;
}
