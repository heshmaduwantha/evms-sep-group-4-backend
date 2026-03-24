import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, UpdateApplicationStatusDto, UpdateApplicationDto } from './dto/application.dto';
import { User } from '../users/entities/user.entity';
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    create(user: User, createApplicationDto: CreateApplicationDto): Promise<import("./entities/application.entity").Application>;
    findAll(): Promise<import("./entities/application.entity").Application[]>;
    findByUser(user: User): Promise<import("./entities/application.entity").Application[]>;
    findByEvent(eventId: string): Promise<import("./entities/application.entity").Application[]>;
    findOne(id: string): Promise<import("./entities/application.entity").Application>;
    updateStatus(id: string, updateApplicationStatusDto: UpdateApplicationStatusDto): Promise<import("./entities/application.entity").Application>;
    update(id: string, updateApplicationDto: UpdateApplicationDto, userId: string): Promise<import("./entities/application.entity").Application>;
    remove(id: string): Promise<void>;
}
