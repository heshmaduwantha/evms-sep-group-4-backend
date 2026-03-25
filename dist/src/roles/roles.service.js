"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("./entities/role.entity");
const event_entity_1 = require("../events/entities/event.entity");
const user_entity_1 = require("../users/entities/user.entity");
const application_entity_1 = require("../applications/entities/application.entity");
const application_status_enum_1 = require("../applications/enums/application-status.enum");
let RolesService = class RolesService {
    roleRepo;
    eventRepo;
    userRepo;
    appRepo;
    constructor(roleRepo, eventRepo, userRepo, appRepo) {
        this.roleRepo = roleRepo;
        this.eventRepo = eventRepo;
        this.userRepo = userRepo;
        this.appRepo = appRepo;
    }
    async getRolesByEvent(eventId) {
        const event = await this.eventRepo.findOne({ where: { id: eventId } });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        return this.roleRepo.find({
            where: { event: { id: eventId } },
            relations: ['assignedVolunteers', 'event'],
        });
    }
    async getAllRoles() {
        return this.roleRepo.find({ relations: ['assignedVolunteers', 'event'] });
    }
    async createRole(dto) {
        const event = await this.eventRepo.findOne({ where: { id: dto.eventId } });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        const role = this.roleRepo.create({
            name: dto.name,
            description: dto.description,
            requiredVolunteers: dto.requiredVolunteers,
            event,
            assignedVolunteers: [],
        });
        return this.roleRepo.save(role);
    }
    async updateRole(roleId, dto) {
        const role = await this.roleRepo.findOne({
            where: { id: roleId },
            relations: ['assignedVolunteers', 'event'],
        });
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        if (dto.requiredVolunteers !== undefined &&
            dto.requiredVolunteers < role.assignedVolunteers.length) {
            throw new common_1.BadRequestException(`Cannot reduce required count below currently assigned volunteers (${role.assignedVolunteers.length})`);
        }
        Object.assign(role, dto);
        return this.roleRepo.save(role);
    }
    async deleteRole(roleId) {
        const role = await this.roleRepo.findOne({ where: { id: roleId } });
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        await this.roleRepo.remove(role);
    }
    async assignVolunteer(roleId, userId) {
        const role = await this.roleRepo.findOne({
            where: { id: roleId },
            relations: ['assignedVolunteers', 'event'],
        });
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const application = await this.appRepo.findOne({
            where: {
                user: { id: userId },
                event: { id: role.event.id },
                status: application_status_enum_1.ApplicationStatus.APPROVED,
            },
            relations: ['user', 'event'],
        });
        if (!application) {
            throw new common_1.BadRequestException('Volunteer does not have an approved application for this event');
        }
        if (role.assignedVolunteers.length >= role.requiredVolunteers) {
            throw new common_1.BadRequestException('Role is already filled to capacity');
        }
        const alreadyAssigned = role.assignedVolunteers.some(v => v.id === userId);
        if (alreadyAssigned)
            throw new common_1.ConflictException('Volunteer is already assigned to this role');
        role.assignedVolunteers.push(user);
        return this.roleRepo.save(role);
    }
    async removeVolunteer(roleId, userId) {
        const role = await this.roleRepo.findOne({
            where: { id: roleId },
            relations: ['assignedVolunteers', 'event'],
        });
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        role.assignedVolunteers = role.assignedVolunteers.filter(v => v.id !== userId);
        return this.roleRepo.save(role);
    }
    async getApprovedVolunteersForEvent(eventId) {
        const applications = await this.appRepo.find({
            where: {
                event: { id: eventId },
                status: application_status_enum_1.ApplicationStatus.APPROVED,
            },
            relations: ['user', 'event'],
        });
        return applications.map(app => ({
            id: app.user.id,
            email: app.user.email,
            skills: app.skills,
        }));
    }
    async getDashboardStats() {
        const roles = await this.roleRepo.find({ relations: ['assignedVolunteers', 'event'] });
        const events = await this.eventRepo.find();
        const totalRoles = roles.length;
        const totalEvents = events.length;
        const volunteersAssigned = new Set(roles.flatMap(r => r.assignedVolunteers.map(v => v.id))).size;
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
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(1, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RolesService);
//# sourceMappingURL=roles.service.js.map