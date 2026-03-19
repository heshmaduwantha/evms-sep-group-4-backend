import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/role.enum';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
    @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
    create(@Body() createEventDto: CreateEventDto) {
        return this.eventsService.create(createEventDto);
    }

    @Get()
    @Roles(UserRole.VOLUNTEER, UserRole.ORGANIZER, UserRole.ADMIN)
    findAll() {
        return this.eventsService.findAll();
    }


    @Get('stats')
    @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
    getStats() {
        return this.eventsService.getStats();
    }

    @Get(':id')
    @Roles(UserRole.VOLUNTEER, UserRole.ORGANIZER, UserRole.ADMIN)
    findOne(@Param('id') id: string) {
        return this.eventsService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
    update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
        return this.eventsService.update(id, updateEventDto);
    }

    @Delete(':id')
    @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.eventsService.remove(id);
    }

    @Post(':id/volunteers/:userId')
    @Roles(UserRole.VOLUNTEER, UserRole.ORGANIZER, UserRole.ADMIN)
    assignVolunteer(@Param('id') id: string, @Param('userId') userId: string) {
        return this.eventsService.assignVolunteer(id, userId);
    }

    @Delete(':id/volunteers/:userId')
    @Roles(UserRole.VOLUNTEER, UserRole.ORGANIZER, UserRole.ADMIN)
    removeVolunteer(@Param('id') id: string, @Param('userId') userId: string) {
        return this.eventsService.removeVolunteer(id, userId);
    }
}
