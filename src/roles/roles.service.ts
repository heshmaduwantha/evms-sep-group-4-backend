import {
  Injectable, NotFoundException, BadRequestException, ConflictException, OnModuleInit
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';
import { Application } from '../applications/entities/application.entity';
import { Volunteer } from '../users/entities/volunteer.entity';
import { ApplicationStatus } from '../applications/enums/application-status.enum';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Application) private appRepo: Repository<Application>,
    @InjectRepository(Volunteer) private manualVolRepo: Repository<Volunteer>,
  ) {}

  async onModuleInit() {
    const roleCount = await this.roleRepo.count();
    if (roleCount === 0) {
      const events = await this.eventRepo.find();
      if (events.length > 0) {
        const defaultRoles = [
          { name: 'Event Coordinator', description: 'Oversee logistics and volunteer tasks.', required: 2 },
          { name: 'Check-in Desk', description: 'Manage attendee registration.', required: 4 },
          { name: 'Technical Support', description: 'Assist with AV and IT setups.', required: 3 },
          { name: 'Crowd Control', description: 'Monitor safety and guide attendees.', required: 5 }
        ];

        for (const event of events) {
          for (const r of defaultRoles) {
            await this.roleRepo.save({
              name: r.name,
              description: r.description,
              requiredVolunteers: r.required,
              event,
              assignedVolunteers: []
            });
          }
        }
        console.log(`[RolesService] Seeded ${events.length * defaultRoles.length} roles.`);
      }
    }
  }

  async getRolesByEvent(eventId: string): Promise<Role[]> {
    console.log(`[RolesService] Fetching roles for event: ${eventId}`);
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    const roles = await this.roleRepo.find({
      where: { event: { id: eventId } },
      relations: ['assignedVolunteers', 'event'],
    });
    console.log(`[RolesService] Found ${roles.length} roles for event: ${eventId}`);
    return roles;
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

    let user = await this.userRepo.findOne({ where: { id: userId } });
    
    // If not in User table, check Volunteer table
    if (!user) {
      const manualVol = await this.manualVolRepo.findOne({ where: { id: userId } });
      if (manualVol) {
        // Try to find user by email first to avoid duplicates
        user = await this.userRepo.findOne({ where: { email: manualVol.email } });
        
        if (!user) {
          // Create a shadow user for the manual volunteer so the ManyToMany relation works
          user = this.userRepo.create({
            id: manualVol.id, 
            email: manualVol.email,
            name: manualVol.name,
            role: 'volunteer' as any,
          });
          // Password is required by some DB constraints but select: false in entity
          (user as any).password = 'MANUAL_VOLUNTEER'; 
          user = await this.userRepo.save(user);
        }
      }
    }

    if (!user) throw new NotFoundException('Volunteer not found in any system');

    // Check eligibility (Approved application OR manual volunteer)
    const application = await this.appRepo.findOne({
      where: {
        user: { id: user.id },
        event: { id: role.event.id },
        status: ApplicationStatus.APPROVED,
      },
    });

    const isManual = await this.manualVolRepo.findOne({ where: { id: user.id } }) || 
                     await this.manualVolRepo.findOne({ where: { email: user.email } });

    if (!application && !isManual) {
      throw new BadRequestException('Volunteer must be either an approved applicant or a registered manual volunteer');
    }

    if (role.assignedVolunteers.length >= role.requiredVolunteers) {
      throw new BadRequestException('Role is already filled to capacity');
    }

    const alreadyAssigned = role.assignedVolunteers.some(v => v.id === user.id);
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
    console.log(`[RolesService] Fetching eligible volunteers for event: ${eventId}`);
    
    // 1. Get approved applicants for this specific event
    const applications = await this.appRepo.find({
      where: {
        event: { id: eventId },
        status: ApplicationStatus.APPROVED,
      },
      relations: ['user'],
    });

    const approvedApplicants = applications.map(app => ({
      id: app.user.id,
      name: app.user.name || app.user.email.split('@')[0],
      email: app.user.email,
      skills: app.skills,
      source: 'Portal Application'
    }));

    // 2. Get all manually registered volunteers (they are eligible for all events)
    const manualVolunteers = await this.manualVolRepo.find();
    const manualList = manualVolunteers.map(vol => ({
      id: vol.id,
      name: vol.name,
      email: vol.email,
      skills: vol.skills,
      source: 'Manual Registration'
    }));

    // Merge and return unique list
    const combined = [...approvedApplicants];
    manualList.forEach(mv => {
      if (!combined.some(c => c.id === mv.id)) {
        combined.push(mv);
      }
    });

    console.log(`[RolesService] Returning ${combined.length} volunteers. First name: ${combined[0]?.name}`);
    return combined;
  }

  async getDashboardStats(): Promise<any> {
    try {
      console.log('[RolesService] Fetching dashboard stats...');
      const roles = await this.roleRepo.find({ relations: ['assignedVolunteers', 'event'] });
      const events = await this.eventRepo.find();

      const totalRoles = roles.length;
      const totalEvents = events.length;
      const volunteersAssigned = new Set(
        roles.flatMap(r => (r.assignedVolunteers || []).map(v => v.id))
      ).size;

      const eventStats = events.map(event => {
        const eventRoles = roles.filter(r => r.event?.id === event.id);
        const totalRequired = eventRoles.reduce((sum, r) => sum + (r.requiredVolunteers || 0), 0);
        const totalAssigned = eventRoles.reduce((sum, r) => sum + (r.assignedVolunteers?.length || 0), 0);
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

      console.log(`[RolesService] Dashboard stats fetched successfully. Events: ${totalEvents}, Roles: ${totalRoles}`);
      return { totalEvents, totalRoles, volunteersAssigned, eventStats };
    } catch (error) {
      console.error('[RolesService] Dashboard error:', error);
      return { totalEvents: 0, totalRoles: 0, volunteersAssigned: 0, eventStats: [] };
    }
  }
}
