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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const attendance_entity_1 = require("./entities/attendance.entity");
const volunteer_entity_1 = require("../users/entities/volunteer.entity");
let AttendanceService = class AttendanceService {
    attendanceRepository;
    volunteerRepository;
    constructor(attendanceRepository, volunteerRepository) {
        this.attendanceRepository = attendanceRepository;
        this.volunteerRepository = volunteerRepository;
    }
    async getAttendanceOverview(eventId) {
        const totalVolunteers = await this.volunteerRepository.count();
        const attendances = await this.attendanceRepository.find({
            where: { eventId }
        });
        const checkedIn = attendances.filter(a => a.status === 'present').length;
        const lateArrivals = attendances.filter(a => a.status === 'late').length;
        const absent = totalVolunteers - (checkedIn + lateArrivals);
        const attendanceRate = totalVolunteers > 0 ? Math.round(((checkedIn + lateArrivals) / totalVolunteers) * 100) : 0;
        return {
            totalVolunteers,
            checkedIn,
            lateArrivals,
            absent,
            attendanceRate
        };
    }
    async getVolunteerRoster(eventId) {
        const volunteers = await this.volunteerRepository.find();
        const rosters = await Promise.all(volunteers.map(async (v) => {
            const attendance = await this.attendanceRepository.findOne({
                where: { volunteer: { id: v.id }, eventId }
            });
            return {
                id: v.id,
                name: v.name,
                role: v.role,
                status: attendance ? attendance.status : 'absent',
                checkedInTime: attendance?.checkInTime
                    ? new Date(attendance.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                    : null
            };
        }));
        return rosters;
    }
    async getRecentCheckIns(eventId) {
        const recent = await this.attendanceRepository.find({
            where: { eventId, status: 'present' },
            order: { checkInTime: 'DESC' },
            take: 10,
            relations: ['volunteer']
        });
        return recent.map(a => ({
            id: a.id,
            name: a.volunteer?.name || 'Unknown',
            time: a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '',
            status: a.status
        }));
    }
    async checkIn(createCheckInDto) {
        const { eventId } = createCheckInDto;
        const volunteerId = createCheckInDto.volunteerId;
        if (!volunteerId) {
            throw new common_1.NotFoundException('volunteerId is required for check in');
        }
        const volunteer = await this.volunteerRepository.findOne({ where: { id: volunteerId } });
        if (!volunteer)
            throw new common_1.NotFoundException('Volunteer not found');
        let attendance = await this.attendanceRepository.findOne({
            where: { volunteer: { id: volunteerId }, eventId }
        });
        if (!attendance) {
            attendance = this.attendanceRepository.create({
                volunteer,
                eventId,
                status: 'present',
                checkInTime: new Date()
            });
        }
        else {
            attendance.status = 'present';
            attendance.checkInTime = new Date();
        }
        await this.attendanceRepository.save(attendance);
        return {
            success: true,
            message: 'Check-in successful',
            timestamp: attendance.checkInTime?.toISOString() || new Date().toISOString()
        };
    }
    async getVolunteerCount() {
        return this.volunteerRepository.count();
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __param(1, (0, typeorm_1.InjectRepository)(volunteer_entity_1.Volunteer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map