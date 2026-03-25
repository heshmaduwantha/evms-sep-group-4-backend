<<<<<<< HEAD
import { OnModuleInit } from '@nestjs/common';
=======
>>>>>>> origin/role_assignment_management_backend
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { CreateApplicationDto, UpdateApplicationStatusDto, UpdateApplicationDto } from './dto/application.dto';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';
<<<<<<< HEAD
export declare class ApplicationsService implements OnModuleInit {
=======
export declare class ApplicationsService {
>>>>>>> origin/role_assignment_management_backend
    private applicationsRepository;
    private eventsRepository;
    private usersRepository;
    constructor(applicationsRepository: Repository<Application>, eventsRepository: Repository<Event>, usersRepository: Repository<User>);
<<<<<<< HEAD
    onModuleInit(): Promise<void>;
=======
>>>>>>> origin/role_assignment_management_backend
    create(userId: string, createApplicationDto: CreateApplicationDto): Promise<Application>;
    findAll(): Promise<Application[]>;
    findByUser(userId: string): Promise<Application[]>;
    findByEvent(eventId: string): Promise<Application[]>;
    findOne(id: string): Promise<Application>;
    updateStatus(id: string, updateApplicationStatusDto: UpdateApplicationStatusDto): Promise<Application>;
    update(id: string, updateApplicationDto: UpdateApplicationDto, userId: string): Promise<Application>;
    remove(id: string): Promise<void>;
}
