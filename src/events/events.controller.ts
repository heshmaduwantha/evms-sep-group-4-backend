import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './event.entity';
import { Query } from '@nestjs/common';

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

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Event | null> {
    return this.eventsService.findOne(id);
  }
  @Put(':id')
  updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: CreateEventDto): Promise<Event> {
    return this.eventsService.updateEvent(id, updateEventDto);
  }
  @Delete(':id')
  deleteEvent(@Param('id') id: string) {
    return this.eventsService.deleteEvent(id);
  }



}