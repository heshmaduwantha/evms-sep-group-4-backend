import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './event.entity';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    createEvent(createEventDto: CreateEventDto): Promise<Event>;
    findAll(): Promise<Event[]>;
    getStats(): Promise<any>;
    findOne(id: string): Promise<Event | null>;
    updateEvent(id: string, updateEventDto: CreateEventDto): Promise<Event>;
    deleteEvent(id: string): Promise<void>;
}
