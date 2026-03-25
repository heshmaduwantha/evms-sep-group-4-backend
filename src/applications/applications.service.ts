import { Injectable, NotFoundException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { CreateApplicationDto, UpdateApplicationStatusDto, UpdateApplicationDto } from './dto/application.dto';
import { ApplicationStatus } from './enums/application-status.enum';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ApplicationsService implements OnModuleInit {
    constructor(
        @InjectRepository(Application)
        private applicationsRepository: Repository<Application>,
        @InjectRepository(Event)
        private eventsRepository: Repository<Event>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async onModuleInit() {
        // Wait a bit for other services to seed
        setTimeout(async () => {
            const count = await this.applicationsRepository.count();
            if (count === 0) {
                const volunteer = await this.usersRepository.findOne({ where: { email: 'volunteer@example.com' } });
                const event = await this.eventsRepository.findOne({ where: { id: 'event-1' } });

                if (volunteer && event) {
                    await this.applicationsRepository.save({
                        user: volunteer,
                        event: event,
                        status: ApplicationStatus.PENDING,
                        motivation: 'I would love to help with the charity gala!',
                        experience: 'Previous experience in event coordination.',
                        skills: 'Communication, Teamwork',
                        appliedDate: new Date()
                    });
                    console.log('[ApplicationsService] Seeded default application for volunteer@example.com to event-1');
                }
            }
        }, 5000);
    }
    async create(userId: string, createApplicationDto: CreateApplicationDto): Promise<Application> {
        const { eventId, motivation, experience, skills, location, gender, experienceDetails } = createApplicationDto;

        const event = await this.eventsRepository.findOne({ where: { id: eventId } });
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check if application already exists
        const existingApplication = await this.applicationsRepository.findOne({
            where: { user: { id: userId }, event: { id: eventId } },
        });

        if (existingApplication) {
            if (existingApplication.status === ApplicationStatus.REJECTED) {
                // Allow re-application
                Object.assign(existingApplication, {
                    ...createApplicationDto,
                    status: ApplicationStatus.PENDING,
                    reapplied: true,
                    appliedDate: new Date(), // Update the date as well
                });
                return this.applicationsRepository.save(existingApplication);
            }
            throw new ConflictException('Application already exists for this event');
        }

        const application = this.applicationsRepository.create({
            user,
            event,
            motivation,
            experience,
            skills,
            location,
            gender,
            experienceDetails,
            status: ApplicationStatus.PENDING,
        });

        return this.applicationsRepository.save(application);
    }

    async findAll(): Promise<Application[]> {
        return this.applicationsRepository.find({
            relations: ['user', 'event'],
            order: { appliedDate: 'DESC' },
        });
    }

    async findByUser(userId: string): Promise<Application[]> {
        return this.applicationsRepository.find({
            where: { user: { id: userId } },
            relations: ['event'],
            order: { appliedDate: 'DESC' },
        });
    }

    async findByEvent(eventId: string): Promise<Application[]> {
        return this.applicationsRepository.find({
            where: { event: { id: eventId } },
            relations: ['user'],
            order: { appliedDate: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Application> {
        const application = await this.applicationsRepository.findOne({
            where: { id },
            relations: ['user', 'event'],
        });
        if (!application) {
            throw new NotFoundException('Application not found');
        }
        return application;
    }

    async updateStatus(id: string, updateApplicationStatusDto: UpdateApplicationStatusDto): Promise<Application> {
        const application = await this.findOne(id);
        
        if (updateApplicationStatusDto.status) {
            application.status = updateApplicationStatusDto.status;
        }
        
        if (updateApplicationStatusDto.notes) {
            application.notes = updateApplicationStatusDto.notes;
        }

        return this.applicationsRepository.save(application);
    }

    async update(id: string, updateApplicationDto: UpdateApplicationDto, userId: string): Promise<Application> {
        const application = await this.findOne(id);
        
        if (application.user.id !== userId) {
            throw new Error('You can only update your own applications');
        }

        if (application.status === ApplicationStatus.APPROVED) {
            throw new Error('Cannot update an approved application');
        }

        Object.assign(application, updateApplicationDto);
        return this.applicationsRepository.save(application);
    }

    async remove(id: string): Promise<void> {
        const application = await this.findOne(id);
        await this.applicationsRepository.remove(application);
    }
}
