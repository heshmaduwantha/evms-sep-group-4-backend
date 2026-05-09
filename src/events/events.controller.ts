import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { Event } from './entities/event.entity';
import { Query } from '@nestjs/common';
import { Patch } from '@nestjs/common';


@Controller('events')
export class EventsController {

  constructor(private readonly eventsService: EventsService) { }

  @Post()
  createEvent(@Body() createEventDto: CreateEventDto): Promise<Event> {
    return this.eventsService.createEvent(createEventDto);
  }

  @Get()
  findAll(
    @Query('search') search: string,
    @Query('status') status: string,
    @Query('date') date: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.eventsService.findAll(search, status, date, page, limit);
  }

  @Get('stats')
  getStats(): Promise<any> {
    return this.eventsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Event | null> {
    return this.eventsService.findOne(id);
  }
  @Patch(':id')
  updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto): Promise<Event> {
    return this.eventsService.updateEvent(id, updateEventDto);
  }
  @Patch(':id/cancel')
  cancelEvent(@Param('id') id: string) {
    return this.eventsService.cancelEvent(id);
  }

  @Delete(':id')
  deleteEvent(@Param('id') id: string) {
    return this.eventsService.deleteEvent(id);
  }
}