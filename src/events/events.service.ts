import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService implements OnModuleInit {

  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) { }

  async onModuleInit() {
    const count = await this.eventRepository.count();
    if (count === 0) {
      await this.eventRepository.save([
        {
          title: 'Spring Charity Gala',
          description: 'Annual charity event to support local youth programs.',
          eventDate: new Date('2026-05-15'),
          eventTime: '18:00',
          location: 'Grand Ballroom, City Hotel',
          volunteersRequired: 50,
          status: 'UPCOMING' as any
        },
        {
          title: 'Tech Conference 2026',
          description: 'A gathering of the best minds in technology.',
          eventDate: new Date('2026-06-20'),
          eventTime: '09:00',
          location: 'Convention Center',
          volunteersRequired: 30,
          status: 'UPCOMING' as any
        }
      ]);
      console.log('[EventsService] Seeded default events: event-1, event-2');
    }
  }

  async createEvent(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create(createEventDto);
    return this.eventRepository.save(event);
  }

  async findAll(
    search?: string,
    status?: string,
    date?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const query = this.eventRepository.createQueryBuilder('event');

    // SEARCH
    if (search) {
      query.andWhere(
        '(event.title ILIKE :search OR event.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // STATUS
    if (status) {
      query.andWhere('event.status = :status', { status });
    }

    // DATE
    if (date) {
      query.andWhere('event.eventDate = :date', { date });
    }

    // PAGINATION
    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data: data.map(event => ({
        ...event,
        assignedVolunteers: 0,
        pendingVolunteers: 0
      })),
      total,
      page,
      limit,
    };
  }

  async getStats(): Promise<any> {
    const events = await this.eventRepository.find();

    const totalEvents = events.length;
    const activeEvents = events.filter(e => e.status === 'ONGOING' || e.status === 'UPCOMING').length;
    const completedEvents = events.filter(e => e.status === 'COMPLETED').length;
    const totalVolunteersRequired = events.reduce((sum, e) => sum + (e.volunteersRequired || 0), 0);

    return {
      totalEvents,
      activeEvents,
      completedEvents,
      totalVolunteersRequired
    };
  }

  async findOne(id: string): Promise<Event | null> {
    return this.eventRepository.findOneBy({ id });
  }

  async updateEvent(id: string, updateEventDto: CreateEventDto): Promise<Event> {
    const event = await this.eventRepository.findOneBy({ id });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    Object.assign(event, updateEventDto);
    return this.eventRepository.save(event);
  }

  async deleteEvent(id: string): Promise<void> {
    const result = await this.eventRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Event not found');
    }
  }

}