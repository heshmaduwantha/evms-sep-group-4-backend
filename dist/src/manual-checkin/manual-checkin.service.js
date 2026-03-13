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
exports.ManualCheckinService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const attendance_entity_1 = require("../attendance/entities/attendance.entity");
const volunteer_entity_1 = require("../users/entities/volunteer.entity");
let ManualCheckinService = class ManualCheckinService {
    volunteerRepository;
    attendanceRepository;
    constructor(volunteerRepository, attendanceRepository) {
        this.volunteerRepository = volunteerRepository;
        this.attendanceRepository = attendanceRepository;
    }
    async getVolunteers(eventId, search, status) {
        const query = this.volunteerRepository.createQueryBuilder('volunteer')
            .leftJoinAndSelect('volunteer.attendances', 'attendance', 'attendance.eventId = :eventId', { eventId });
        if (search && search.trim()) {
            query.andWhere('(LOWER(volunteer.name) LIKE LOWER(:search) OR LOWER(volunteer.role) LIKE LOWER(:search))', { search: `%${search}%` });
        }
        const volunteers = await query.getMany();
        const formattedVolunteers = volunteers.map(v => {
            const attendance = v.attendances?.[0];
            const isCheckedIn = attendance?.status === 'present' || attendance?.status === 'late';
            let formattedTime = null;
            if (attendance?.checkInTime) {
                formattedTime = new Date(attendance.checkInTime).toLocaleTimeString('en-US', {
                    hour: '2-digit', minute: '2-digit', hour12: true
                });
            }
            return {
                id: v.id,
                name: v.name,
                role: v.role,
                department: v.department,
                qrCode: v.qrCode,
                checkedIn: isCheckedIn,
                time: formattedTime,
            };
        });
        let filtered = formattedVolunteers;
        if (status === 'checked-in') {
            filtered = formattedVolunteers.filter(v => v.checkedIn);
        }
        else if (status === 'absent') {
            filtered = formattedVolunteers.filter(v => !v.checkedIn);
        }
        return {
            volunteers: filtered,
            total: formattedVolunteers.length,
            checkedIn: formattedVolunteers.filter(v => v.checkedIn).length,
        };
    }
    async getCheckinSummary(eventId) {
        const total = await this.volunteerRepository.count();
        const checkedInCount = await this.attendanceRepository.createQueryBuilder('attendance')
            .where('attendance.eventId = :eventId', { eventId })
            .andWhere('attendance.status IN (:...statuses)', { statuses: ['present', 'late'] })
            .getCount();
        return {
            total,
            checkedIn: checkedInCount,
            absent: total - checkedInCount,
            percentage: total > 0 ? Math.round((checkedInCount / total) * 100) : 0,
        };
    }
    async updateCheckin(volunteerId, eventId, updateCheckinDto) {
        const volunteer = await this.volunteerRepository.findOne({ where: { id: volunteerId } });
        if (!volunteer) {
            throw new common_1.NotFoundException('Volunteer not found');
        }
        let attendance = await this.attendanceRepository.findOne({
            where: { volunteer: { id: volunteerId }, eventId }
        });
        if (!attendance) {
            attendance = this.attendanceRepository.create({
                volunteer,
                eventId,
            });
        }
        if (updateCheckinDto.checkedIn) {
            attendance.status = 'present';
            attendance.checkInTime = new Date();
            attendance.checkInMethod = 'manual';
        }
        else {
            attendance.status = 'absent';
            attendance.checkInTime = null;
        }
        await this.attendanceRepository.save(attendance);
        return {
            success: true,
            volunteer: {
                id: volunteer.id,
                name: volunteer.name,
                checkedIn: updateCheckinDto.checkedIn,
                time: attendance.checkInTime ? attendance.checkInTime.toLocaleTimeString('en-US', {
                    hour: '2-digit', minute: '2-digit', hour12: true
                }) : null
            }
        };
    }
    async markAbsent(volunteerId, eventId) {
        return this.updateCheckin(volunteerId, eventId, { checkedIn: false });
    }
    async updateVolunteer(id, updateDto) {
        const volunteer = await this.volunteerRepository.findOne({ where: { id } });
        if (!volunteer) {
            throw new common_1.NotFoundException('Volunteer not found');
        }
        Object.assign(volunteer, {
            name: updateDto.name,
            role: updateDto.role,
            department: updateDto.department,
        });
        await this.volunteerRepository.save(volunteer);
        if (updateDto.hasOwnProperty('checkedIn')) {
            await this.updateCheckin(id, updateDto.eventId, { checkedIn: updateDto.checkedIn });
        }
        return volunteer;
    }
    async deleteVolunteer(id) {
        const result = await this.volunteerRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException('Volunteer not found');
        }
        return { success: true };
    }
    async createAttendance(eventId, createAttendanceDto) {
        const volunteer = this.volunteerRepository.create({
            name: createAttendanceDto.name,
            role: createAttendanceDto.role,
            department: createAttendanceDto.department,
            qrCode: `QR_MANUAL_${Date.now()}`
        });
        await this.volunteerRepository.save(volunteer);
        const isCheckedIn = createAttendanceDto.checkedIn || false;
        const attendance = this.attendanceRepository.create({
            volunteer,
            eventId,
            status: isCheckedIn ? 'present' : 'absent',
            checkInTime: isCheckedIn ? new Date() : null
        });
        await this.attendanceRepository.save(attendance);
        return {
            success: true,
            volunteer: {
                id: volunteer.id,
                name: volunteer.name,
                role: volunteer.role,
                department: volunteer.department,
                checkedIn: isCheckedIn,
                time: attendance.checkInTime ? attendance.checkInTime.toLocaleTimeString('en-US', {
                    hour: '2-digit', minute: '2-digit', hour12: true
                }) : null
            }
        };
    }
};
exports.ManualCheckinService = ManualCheckinService;
exports.ManualCheckinService = ManualCheckinService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(volunteer_entity_1.Volunteer)),
    __param(1, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ManualCheckinService);
//# sourceMappingURL=manual-checkin.service.js.map