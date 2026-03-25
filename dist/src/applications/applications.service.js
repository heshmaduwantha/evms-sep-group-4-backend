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
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const application_entity_1 = require("./entities/application.entity");
const application_status_enum_1 = require("./enums/application-status.enum");
const event_entity_1 = require("../events/entities/event.entity");
const user_entity_1 = require("../users/entities/user.entity");
let ApplicationsService = class ApplicationsService {
    applicationsRepository;
    eventsRepository;
    usersRepository;
    constructor(applicationsRepository, eventsRepository, usersRepository) {
        this.applicationsRepository = applicationsRepository;
        this.eventsRepository = eventsRepository;
        this.usersRepository = usersRepository;
    }
<<<<<<< HEAD
    async onModuleInit() {
        setTimeout(async () => {
            const count = await this.applicationsRepository.count();
            if (count === 0) {
                const volunteer = await this.usersRepository.findOne({ where: { email: 'volunteer@example.com' } });
                const event = await this.eventsRepository.findOne({ where: { id: 'event-1' } });
                if (volunteer && event) {
                    await this.applicationsRepository.save({
                        user: volunteer,
                        event: event,
                        status: application_status_enum_1.ApplicationStatus.PENDING,
                        motivation: 'I would love to help with the charity gala!',
                        experience: 'Previous experience in event coordination.',
                        skills: 'Communication, Teamwork',
                        appliedDate: new Date()
                    });
                    console.log('[ApplicationsService] Seeded default application for volunteer@example.com to event-1');
                }
            }
        }, 5000);
    }
=======
>>>>>>> origin/role_assignment_management_backend
    async create(userId, createApplicationDto) {
        const { eventId, motivation, experience, skills } = createApplicationDto;
        const event = await this.eventsRepository.findOne({ where: { id: eventId } });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const existingApplication = await this.applicationsRepository.findOne({
            where: { user: { id: userId }, event: { id: eventId } },
        });
        if (existingApplication) {
            if (existingApplication.status === application_status_enum_1.ApplicationStatus.REJECTED) {
                Object.assign(existingApplication, {
                    ...createApplicationDto,
                    status: application_status_enum_1.ApplicationStatus.PENDING,
                    reapplied: true,
                    appliedDate: new Date(),
                });
                return this.applicationsRepository.save(existingApplication);
            }
            throw new common_1.ConflictException('Application already exists for this event');
        }
        const application = this.applicationsRepository.create({
            user,
            event,
            motivation,
            experience,
            skills,
            status: application_status_enum_1.ApplicationStatus.PENDING,
        });
        return this.applicationsRepository.save(application);
    }
    async findAll() {
        return this.applicationsRepository.find({
            relations: ['user', 'event'],
            order: { appliedDate: 'DESC' },
        });
    }
    async findByUser(userId) {
        return this.applicationsRepository.find({
            where: { user: { id: userId } },
            relations: ['event'],
            order: { appliedDate: 'DESC' },
        });
    }
    async findByEvent(eventId) {
        return this.applicationsRepository.find({
            where: { event: { id: eventId } },
            relations: ['user'],
            order: { appliedDate: 'DESC' },
        });
    }
    async findOne(id) {
        const application = await this.applicationsRepository.findOne({
            where: { id },
            relations: ['user', 'event'],
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        return application;
    }
    async updateStatus(id, updateApplicationStatusDto) {
        const application = await this.findOne(id);
        if (updateApplicationStatusDto.status) {
            application.status = updateApplicationStatusDto.status;
        }
        if (updateApplicationStatusDto.notes) {
            application.notes = updateApplicationStatusDto.notes;
        }
        return this.applicationsRepository.save(application);
    }
    async update(id, updateApplicationDto, userId) {
        const application = await this.findOne(id);
        if (application.user.id !== userId) {
            throw new Error('You can only update your own applications');
        }
        if (application.status === application_status_enum_1.ApplicationStatus.APPROVED) {
            throw new Error('Cannot update an approved application');
        }
        Object.assign(application, updateApplicationDto);
        return this.applicationsRepository.save(application);
    }
    async remove(id) {
        const application = await this.findOne(id);
        await this.applicationsRepository.remove(application);
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __param(1, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map