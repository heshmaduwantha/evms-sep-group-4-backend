import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
export declare class EventsService {
    private eventRepository;
    constructor(eventRepository: Repository<Event>);
    createEvent(createEventDto: CreateEventDto): Promise<Event>;
    findAll(): Promise<Event[]>;
    getStats(): Promise<any>;
    findOne(id: string): Promise<Event | null>;
    updateEvent(id: string, updateEventDto: CreateEventDto): Promise<Event>;
    deleteEvent(id: string): Promise<void>;
}
