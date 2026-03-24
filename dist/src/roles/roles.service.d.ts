import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';
import { Application } from '../applications/entities/application.entity';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
export declare class RolesService {
    private roleRepo;
    private eventRepo;
    private userRepo;
    private appRepo;
    constructor(roleRepo: Repository<Role>, eventRepo: Repository<Event>, userRepo: Repository<User>, appRepo: Repository<Application>);
    getRolesByEvent(eventId: string): Promise<Role[]>;
    getAllRoles(): Promise<Role[]>;
    createRole(dto: CreateRoleDto): Promise<Role>;
    updateRole(roleId: string, dto: UpdateRoleDto): Promise<Role>;
    deleteRole(roleId: string): Promise<void>;
    assignVolunteer(roleId: string, userId: string): Promise<Role>;
    removeVolunteer(roleId: string, userId: string): Promise<Role>;
    getApprovedVolunteersForEvent(eventId: string): Promise<any[]>;
    getDashboardStats(): Promise<any>;
}
