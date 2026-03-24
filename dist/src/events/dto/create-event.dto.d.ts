import { EventStatus } from '../event.entity';
export declare class CreateEventDto {
    title: string;
    description: string;
    eventDate: string;
    eventTime: string;
    location: string;
    volunteersRequired: number;
    status?: EventStatus;
}
