import {
  Injectable, NotFoundException, BadRequestException, ConflictException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';
import { Application } from '../applications/entities/application.entity';
import { ApplicationStatus } from '../applications/enums/application-status.enum';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Application) private appRepo: Repository<Application>,
  ) {}

  async getRolesByEvent(eventId: string): Promise<Role[]> {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    return this.roleRepo.find({
      where: { event: { id: eventId } },
      relations: ['assignedVolunteers', 'event'],
    });
  }

  async getAllRoles(): Promise<Role[]> {
    return this.roleRepo.find({ relations: ['assignedVolunteers', 'event'] });
  }

  async createRole(dto: CreateRoleDto): Promise<Role> {
    const event = await this.eventRepo.findOne({ where: { id: dto.eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const role = this.roleRepo.create({
      name: dto.name,
      description: dto.description,
      requiredVolunteers: dto.requiredVolunteers,
      event,
      assignedVolunteers: [],
    });
    return this.roleRepo.save(role);
  }

  async updateRole(roleId: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.roleRepo.findOne({
      where: { id: roleId },
      relations: ['assignedVolunteers', 'event'],
    });
    if (!role) throw new NotFoundException('Role not found');

    if (dto.requiredVolunteers !== undefined &&
        dto.requiredVolunteers < role.assignedVolunteers.length) {
      throw new BadRequestException(
        `Cannot reduce required count below currently assigned volunteers (${role.assignedVolunteers.length})`
      );
    }

    Object.assign(role, dto);
    return this.roleRepo.save(role);
  }

  async deleteRole(roleId: string): Promise<void> {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');
    await this.roleRepo.remove(role);
  }

  async assignVolunteer(roleId: string, userId: string): Promise<Role> {
    const role = await this.roleRepo.findOne({
      where: { id: roleId },
      relations: ['assignedVolunteers', 'event'],
    });
    if (!role) throw new NotFoundException('Role not found');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Check if approved application exists for this event
    const application = await this.appRepo.findOne({
      where: {
        user: { id: userId },
        event: { id: role.event.id },
        status: ApplicationStatus.APPROVED,
      },
      relations: ['user', 'event'],
    });
    if (!application) {
      throw new BadRequestException('Volunteer does not have an approved application for this event');
    }

    if (role.assignedVolunteers.length >= role.requiredVolunteers) {
      throw new BadRequestException('Role is already filled to capacity');
    }

    const alreadyAssigned = role.assignedVolunteers.some(v => v.id === userId);
    if (alreadyAssigned) throw new ConflictException('Volunteer is already assigned to this role');

    role.assignedVolunteers.push(user);
    return this.roleRepo.save(role);
  }

  async removeVolunteer(roleId: string, userId: string): Promise<Role> {
    const role = await this.roleRepo.findOne({
      where: { id: roleId },
      relations: ['assignedVolunteers', 'event'],
    });
    if (!role) throw new NotFoundException('Role not found');

    role.assignedVolunteers = role.assignedVolunteers.filter(v => v.id !== userId);
    return this.roleRepo.save(role);
  }

  async getApprovedVolunteersForEvent(eventId: string): Promise<any[]> {
    const applications = await this.appRepo.find({
      where: {
        event: { id: eventId },
        status: ApplicationStatus.APPROVED,
      },
      relations: ['user', 'event'],
    });
    return applications.map(app => ({
      id: app.user.id,
      // name: app.user.name,
      email: app.user.email,
      skills: app.skills,
    }));
  }

  async getDashboardStats(): Promise<any> {
    const roles = await this.roleRepo.find({ relations: ['assignedVolunteers', 'event'] });
    const events = await this.eventRepo.find();

    const totalRoles = roles.length;
    const totalEvents = events.length;
    const volunteersAssigned = new Set(
      roles.flatMap(r => r.assignedVolunteers.map(v => v.id))
    ).size;

    const eventStats = events.map(event => {
      const eventRoles = roles.filter(r => r.event?.id === event.id);
      const totalRequired = eventRoles.reduce((sum, r) => sum + r.requiredVolunteers, 0);
      const totalAssigned = eventRoles.reduce((sum, r) => sum + r.assignedVolunteers.length, 0);
      return {
        eventId: event.id,
        eventTitle: event.title,
        date: event.date,
        location: event.location,
        totalRoles: eventRoles.length,
        totalRequired,
        totalAssigned,
        coveragePercent: totalRequired > 0 ? Math.round((totalAssigned / totalRequired) * 100) : 0,
      };
    });

    return { totalEvents, totalRoles, volunteersAssigned, eventStats };
  }
}
