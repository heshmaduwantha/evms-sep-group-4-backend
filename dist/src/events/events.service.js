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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_entity_1 = require("./entities/event.entity");
const user_entity_1 = require("../users/entities/user.entity");
let EventsService = class EventsService {
    eventsRepository;
    usersRepository;
    constructor(eventsRepository, usersRepository) {
        this.eventsRepository = eventsRepository;
        this.usersRepository = usersRepository;
    }
    async create(createEventDto) {
        const organizer = await this.usersRepository.findOne({ where: { id: createEventDto.organizerId } });
        if (!organizer) {
            throw new common_1.NotFoundException(`Organizer with ID ${createEventDto.organizerId} not found`);
        }
        const event = this.eventsRepository.create({
            ...createEventDto,
            organizer,
        });
        return this.eventsRepository.save(event);
    }
    async findAll() {
        return this.eventsRepository.find({
            relations: ['organizer', 'volunteers'],
            order: { date: 'DESC' }
        });
    }
    async findOne(id) {
        const event = await this.eventsRepository.findOne({
            where: { id },
            relations: ['organizer', 'volunteers']
        });
        if (!event) {
            throw new common_1.NotFoundException(`Event with ID ${id} not found`);
        }
        return event;
    }
    async update(id, updateEventDto) {
        await this.eventsRepository.update(id, updateEventDto);
        return this.findOne(id);
    }
    async remove(id) {
        const result = await this.eventsRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Event with ID ${id} not found`);
        }
    }
    async assignVolunteer(eventId, userId) {
        const event = await this.findOne(eventId);
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        if (!event.volunteers) {
            event.volunteers = [];
        }
        if (!event.volunteers.find(v => v.id === userId)) {
            event.volunteers.push(user);
        }
        return this.eventsRepository.save(event);
    }
    async removeVolunteer(eventId, userId) {
        const event = await this.findOne(eventId);
        event.volunteers = event.volunteers.filter(v => v.id !== userId);
        return this.eventsRepository.save(event);
    }
    async getStats() {
        const totalEvents = await this.eventsRepository.count();
        const upcomingEvents = await this.eventsRepository.count({ where: { status: event_entity_1.EventStatus.UPCOMING } });
        const activeEvents = await this.eventsRepository.count({ where: { status: event_entity_1.EventStatus.ACTIVE } });
        const completedEvents = await this.eventsRepository.count({ where: { status: event_entity_1.EventStatus.COMPLETED } });
        return {
            totalEvents,
            upcomingEvents,
            activeEvents,
            completedEvents
        };
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], EventsService);
//# sourceMappingURL=events.service.js.map