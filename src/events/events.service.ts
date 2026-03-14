import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventStatus } from './entities/event.entity';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(Event)
        private eventsRepository: Repository<Event>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(createEventDto: CreateEventDto): Promise<Event> {
        const organizer = await this.usersRepository.findOne({ where: { id: createEventDto.organizerId } });
        if (!organizer) {
            throw new NotFoundException(`Organizer with ID ${createEventDto.organizerId} not found`);
        }

        const event = this.eventsRepository.create({
            ...createEventDto,
            organizer,
        });
        return this.eventsRepository.save(event);
    }

    async findAll(): Promise<Event[]> {
        return this.eventsRepository.find({
            relations: ['organizer', 'volunteers'],
            order: { date: 'DESC' }
        });
    }

    async findOne(id: string): Promise<Event> {
        const event = await this.eventsRepository.findOne({
            where: { id },
            relations: ['organizer', 'volunteers']
        });
        if (!event) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }
        return event;
    }

    async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
        await this.eventsRepository.update(id, updateEventDto);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        const result = await this.eventsRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }
    }

    async assignVolunteer(eventId: string, userId: string): Promise<Event> {
        const event = await this.findOne(eventId);
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        if (!event.volunteers) {
            event.volunteers = [];
        }

        if (!event.volunteers.find(v => v.id === userId)) {
            event.volunteers.push(user);
        }

        return this.eventsRepository.save(event);
    }

    async removeVolunteer(eventId: string, userId: string): Promise<Event> {
        const event = await this.findOne(eventId);
        event.volunteers = event.volunteers.filter(v => v.id !== userId);
        return this.eventsRepository.save(event);
    }

    async getStats() {
        const totalEvents = await this.eventsRepository.count();
        const upcomingEvents = await this.eventsRepository.count({ where: { status: EventStatus.UPCOMING } });
        const activeEvents = await this.eventsRepository.count({ where: { status: EventStatus.ACTIVE } });
        const completedEvents = await this.eventsRepository.count({ where: { status: EventStatus.COMPLETED } });

        return {
            totalEvents,
            upcomingEvents,
            activeEvents,
            completedEvents
        };
    }
}
