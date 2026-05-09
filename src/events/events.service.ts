import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { EventStatus } from './entities/event.entity';


@Injectable()
export class EventsService implements OnModuleInit {

  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) { }

  async onModuleInit() {
    const count = await this.eventRepository.count();
    const organizer = await this.eventRepository.manager.getRepository('User').findOne({ where: { role: 'organizer' } });
    const eventSeeds = [
        {
          title: 'Spring Charity Gala',
          description: 'Annual charity event to support local youth programs.',
          date: '2026-05-15',
          time: '18:00',
          location: 'Grand Ballroom, City Hotel',
          volunteersNeeded: 50,
          status: EventStatus.UPCOMING,
        },
        {
          title: 'Tech Conference 2026',
          description: 'A gathering of the best minds in technology.',
          date: '2026-06-10',
          time: '09:00',
          location: 'Convention Center',
          volunteersNeeded: 30,
          status: EventStatus.UPCOMING,
        },
        {
          title: 'Community Clean-up',
          description: 'Local park cleaning and restoration.',
          date: '2026-05-20',
          time: '08:00',
          location: 'Central Park',
          volunteersNeeded: 100,
          status: EventStatus.UPCOMING,
        },
        {
          title: 'Food Bank Distribution',
          description: 'Weekly food distribution for families in need.',
          date: '2026-05-12',
          time: '10:00',
          location: 'Westside Community Center',
          volunteersNeeded: 15,
          status: EventStatus.ACTIVE,
        }
      ];

      for (const seed of eventSeeds) {
        const existing = await this.eventRepository.findOne({ where: { title: seed.title } });
        if (!existing) {
          await this.eventRepository.save({
            ...seed,
            organizer: organizer || undefined
          });
          console.log(`[EventsService] Seeded event: ${seed.title}`);
        }
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

    const activeEvents = events.filter(
      e => e.status === EventStatus.UPCOMING || e.status === EventStatus.ACTIVE
    ).length;

    const completedEvents = events.filter(
      e => e.status === EventStatus.COMPLETED
    ).length;

    const totalVolunteersRequired = events.reduce((sum, e) => sum + (e.volunteersNeeded || 0), 0);

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

  async updateEvent(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.eventRepository.findOneBy({ id });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    Object.assign(event, updateEventDto);
    return this.eventRepository.save(event);
  }

  async cancelEvent(id: string) {
    return this.eventRepository.update(id, {
      status: EventStatus.CANCELLED
    });
  }
  async deleteEvent(id: string): Promise<void> {
    const result = await this.eventRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Event not found');
    }
  }

}