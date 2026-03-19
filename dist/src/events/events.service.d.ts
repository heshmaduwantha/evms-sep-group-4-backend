import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { User } from '../users/entities/user.entity';
export declare class EventsService {
    private eventsRepository;
    private usersRepository;
    constructor(eventsRepository: Repository<Event>, usersRepository: Repository<User>);
    create(createEventDto: CreateEventDto): Promise<Event>;
    findAll(): Promise<Event[]>;
    findOne(id: string): Promise<Event>;
    update(id: string, updateEventDto: UpdateEventDto): Promise<Event>;
    remove(id: string): Promise<void>;
    assignVolunteer(eventId: string, userId: string): Promise<Event>;
    removeVolunteer(eventId: string, userId: string): Promise<Event>;
    getStats(): Promise<{
        totalEvents: number;
        upcomingEvents: number;
        activeEvents: number;
        completedEvents: number;
    }>;
}
