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
const application_entity_1 = require("../applications/entities/application.entity");
const application_status_enum_1 = require("../applications/enums/application-status.enum");
let ManualCheckinService = class ManualCheckinService {
    volunteerRepository;
    attendanceRepository;
    applicationRepository;
    constructor(volunteerRepository, attendanceRepository, applicationRepository) {
        this.volunteerRepository = volunteerRepository;
        this.attendanceRepository = attendanceRepository;
        this.applicationRepository = applicationRepository;
    }
    async getVolunteers(eventId, search, status) {
        const volunteers = await this.volunteerRepository.find({
            relations: ['attendances']
        });
        const approvedApplications = await this.applicationRepository.find({
            relations: ['user', 'event']
        });
        let formattedVolunteers = volunteers.map(v => {
            const attendance = (eventId === 'all' || !eventId)
                ? v.attendances?.[0]
                : v.attendances?.find(a => a.eventId === eventId);
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
                checkedIn: isCheckedIn,
                time: formattedTime,
                eventId: attendance?.eventId || (eventId === 'all' ? undefined : eventId),
                checkInMethod: attendance?.checkInMethod || 'manual'
            };
        });
        if (eventId === 'all' || !eventId) {
            const consolidated = [];
            const seenNames = new Set();
            formattedVolunteers.forEach(v => {
                const lowerName = v.name.toLowerCase();
                if (!seenNames.has(lowerName)) {
                    seenNames.add(lowerName);
                    consolidated.push(v);
                }
                else if (v.checkedIn) {
                    const existing = consolidated.find(ext => ext.name.toLowerCase() === lowerName);
                    if (existing && !existing.checkedIn) {
                        existing.checkedIn = true;
                        existing.time = v.time;
                        existing.eventId = v.eventId;
                    }
                }
            });
            formattedVolunteers = consolidated;
        }
        const portalEntries = [];
        const approvedApps = eventId === 'all' || !eventId
            ? approvedApplications.filter(app => app.status === application_status_enum_1.ApplicationStatus.APPROVED)
            : approvedApplications.filter(app => app.status === application_status_enum_1.ApplicationStatus.APPROVED && app.event.id === eventId);
        approvedApps.forEach(app => {
            const portalName = app.user.email.split('@')[0];
            const lowerPortalName = portalName.toLowerCase();
            const existsInManual = formattedVolunteers.some(v => v.name.toLowerCase() === lowerPortalName);
            const existsInPortal = portalEntries.some(v => v.name.toLowerCase() === lowerPortalName);
            if (!existsInManual && !existsInPortal) {
                portalEntries.push({
                    id: app.id,
                    name: portalName,
                    role: 'Volunteer',
                    department: 'Portal',
                    checkedIn: true,
                    time: new Date(app.updatedAt).toLocaleTimeString('en-US', {
                        hour: '2-digit', minute: '2-digit', hour12: true
                    }),
                    eventId: app.event.id,
                    checkInMethod: 'online'
                });
            }
        });
        const allVolunteers = [...formattedVolunteers, ...portalEntries];
        let filtered = allVolunteers;
        if (search && search.trim()) {
            const s = search.toLowerCase();
            filtered = filtered.filter(v => v.name.toLowerCase().includes(s) ||
                v.role.toLowerCase().includes(s) ||
                v.department.toLowerCase().includes(s));
        }
        if (status === 'checked-in' || status === 'present') {
            filtered = filtered.filter(v => v.checkedIn);
        }
        else if (status === 'absent') {
            filtered = filtered.filter(v => !v.checkedIn);
        }
        return {
            volunteers: filtered,
            total: allVolunteers.length,
            checkedIn: allVolunteers.filter(v => v.checkedIn).length,
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
    __param(2, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ManualCheckinService);
//# sourceMappingURL=manual-checkin.service.js.map