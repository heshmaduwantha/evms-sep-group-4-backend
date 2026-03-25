import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, AssignVolunteerDto } from './dto/role.dto';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    getDashboardStats(): Promise<any>;
    getRolesByEvent(eventId: string): Promise<import("./entities/role.entity").Role[]>;
    getApprovedVolunteers(eventId: string): Promise<any[]>;
    getAllRoles(): Promise<import("./entities/role.entity").Role[]>;
    createRole(dto: CreateRoleDto): Promise<import("./entities/role.entity").Role>;
    updateRole(id: string, dto: UpdateRoleDto): Promise<import("./entities/role.entity").Role>;
    deleteRole(id: string): Promise<void>;
    assignVolunteer(id: string, dto: AssignVolunteerDto): Promise<import("./entities/role.entity").Role>;
    removeVolunteer(id: string, userId: string): Promise<import("./entities/role.entity").Role>;
}
