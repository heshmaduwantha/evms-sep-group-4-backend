import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    create(createEventDto: CreateEventDto): Promise<import("./entities/event.entity").Event>;
    findAll(): Promise<import("./entities/event.entity").Event[]>;
    getStats(): Promise<{
        totalEvents: number;
        upcomingEvents: number;
        activeEvents: number;
        completedEvents: number;
    }>;
    findOne(id: string): Promise<import("./entities/event.entity").Event>;
    update(id: string, updateEventDto: UpdateEventDto): Promise<import("./entities/event.entity").Event>;
    remove(id: string): Promise<void>;
    assignVolunteer(id: string, userId: string): Promise<import("./entities/event.entity").Event>;
    removeVolunteer(id: string, userId: string): Promise<import("./entities/event.entity").Event>;
}
