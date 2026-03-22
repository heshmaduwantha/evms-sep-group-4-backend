import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {

  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async createEvent(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create(createEventDto);
    return this.eventRepository.save(event);
  }

  async findAll(): Promise<Event[]> {
    return this.eventRepository.find();
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