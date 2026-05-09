import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, UpdateApplicationStatusDto, UpdateApplicationDto } from './dto/application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserRole } from '../users/enums/role.enum';
import { User } from '../users/entities/user.entity';

@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationsController {
    constructor(private readonly applicationsService: ApplicationsService) {}

    @Post()
    @Roles(UserRole.VOLUNTEER)
    create(@GetUser() user: User, @Body() createApplicationDto: CreateApplicationDto) {
        return this.applicationsService.create(user.id, createApplicationDto);
    }

    @Get()
    @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
    findAll() {
        return this.applicationsService.findAll();
    }

    @Get('my')
    @Roles(UserRole.VOLUNTEER)
    findByUser(@GetUser() user: User) {
        return this.applicationsService.findByUser(user.id);
    }

    @Get('event/:eventId')
    @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
    findByEvent(@Param('eventId') eventId: string) {
        return this.applicationsService.findByEvent(eventId);
    }

    @Get(':id')
    @Roles(UserRole.VOLUNTEER, UserRole.ORGANIZER, UserRole.ADMIN)
    findOne(@Param('id') id: string) {
        return this.applicationsService.findOne(id);
    }

    @Patch(':id/status')
    @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
    updateStatus(@Param('id') id: string, @Body() updateApplicationStatusDto: UpdateApplicationStatusDto) {
        return this.applicationsService.updateStatus(id, updateApplicationStatusDto);
    }

    @Patch(':id')
    @Roles(UserRole.VOLUNTEER)
    update(@Param('id') id: string, @Body() updateApplicationDto: UpdateApplicationDto, @GetUser() user: User) {
        return this.applicationsService.update(id, updateApplicationDto, user.id);
    }

    @Delete(':id')
    @Roles(UserRole.VOLUNTEER, UserRole.ORGANIZER, UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.applicationsService.remove(id);
    }
}
