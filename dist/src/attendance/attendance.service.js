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
const application_entity_1 = require("../applications/entities/application.entity");
const application_status_enum_1 = require("../applications/enums/application-status.enum");
let AttendanceService = class AttendanceService {
    attendanceRepository;
    volunteerRepository;
    applicationRepository;
    constructor(attendanceRepository, volunteerRepository, applicationRepository) {
        this.attendanceRepository = attendanceRepository;
        this.volunteerRepository = volunteerRepository;
        this.applicationRepository = applicationRepository;
    }
    async onModuleInit() {
        const vCount = await this.volunteerRepository.count();
        const aCount = await this.attendanceRepository.count();
        if (vCount === 0) {
            console.log('Seeding initial volunteer and attendance data...');
            const v1 = await this.volunteerRepository.save(this.volunteerRepository.create({
                name: 'Sarah Wilson',
                role: 'Team Lead',
                department: 'Operations'
            }));
            const v2 = await this.volunteerRepository.save(this.volunteerRepository.create({
                name: 'John Doe',
                role: 'Volunteer',
                department: 'Front Desk'
            }));
            await this.attendanceRepository.save([
                this.attendanceRepository.create({
                    volunteer: v1,
                    eventId: 'event-1',
                    status: 'present',
                    checkInTime: new Date(),
                    checkInMethod: 'manual'
                }),
                this.attendanceRepository.create({
                    volunteer: v2,
                    eventId: 'event-1',
                    status: 'late',
                    checkInTime: new Date(),
                    checkInMethod: 'manual'
                })
            ]);
        }
    }
    async getAttendanceOverview(eventId) {
        const isAll = eventId === 'all' || !eventId || eventId === '';
        const totalVolunteersCount = await this.volunteerRepository.count();
        const attendances = await this.attendanceRepository.find({
            where: isAll ? {} : { eventId }
        });
        const portalAttendances = await this.applicationRepository.count({
            where: isAll
                ? { status: application_status_enum_1.ApplicationStatus.APPROVED }
                : { event: { id: eventId }, status: application_status_enum_1.ApplicationStatus.APPROVED }
        });
        const manualCheckedIn = attendances.filter(a => a.status === 'present').length;
        const manualLate = attendances.filter(a => a.status === 'late').length;
        const checkedIn = manualCheckedIn + portalAttendances;
        const lateArrivals = manualLate;
        const portalVolunteersCount = await this.applicationRepository.count({
            where: isAll
                ? { status: application_status_enum_1.ApplicationStatus.APPROVED }
                : { event: { id: eventId }, status: application_status_enum_1.ApplicationStatus.APPROVED }
        });
        const totalVolunteers = totalVolunteersCount + portalVolunteersCount;
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
        const isAll = eventId === 'all' || !eventId || eventId === '';
        const volunteers = await this.volunteerRepository.find({
            relations: ['attendances']
        });
        let manualRoster = volunteers.map((v) => {
            const attendance = isAll
                ? v.attendances?.[0]
                : v.attendances?.find(a => a.eventId === eventId);
            return {
                id: v.id,
                name: v.name,
                role: v.role,
                status: attendance ? attendance.status : 'absent',
                checkedInTime: attendance?.checkInTime
                    ? new Date(attendance.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                    : null,
                eventId: attendance?.eventId || (isAll ? undefined : eventId),
                method: 'manual'
            };
        });
        if (isAll) {
            const consolidated = [];
            const seenNames = new Set();
            manualRoster.sort((a, b) => (a.status !== 'absent' ? -1 : 1));
            manualRoster.forEach(r => {
                if (!seenNames.has(r.name.toLowerCase())) {
                    seenNames.add(r.name.toLowerCase());
                    consolidated.push(r);
                }
            });
            manualRoster = consolidated;
        }
        const portalApps = await this.applicationRepository.find({
            where: isAll
                ? { status: application_status_enum_1.ApplicationStatus.APPROVED }
                : { event: { id: eventId }, status: application_status_enum_1.ApplicationStatus.APPROVED },
            relations: ['user', 'event']
        });
        const portalRoster = [];
        const seenPortalNames = new Set();
        portalApps.forEach(app => {
            const name = app.user.email.split('@')[0];
            const lowerName = name.toLowerCase();
            if (!isAll || !seenPortalNames.has(lowerName)) {
                if (isAll)
                    seenPortalNames.add(lowerName);
                if (!isAll || !manualRoster.some(m => m.name.toLowerCase() === lowerName)) {
                    portalRoster.push({
                        id: app.id,
                        name: name,
                        role: 'Volunteer',
                        status: 'present',
                        checkedInTime: new Date(app.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                        eventId: app.event.id,
                        method: 'online'
                    });
                }
            }
        });
        return [...manualRoster, ...portalRoster];
    }
    async getRecentCheckIns(eventId) {
        const whereClause = { status: 'present' };
        if (eventId && eventId !== '' && eventId !== 'all') {
            whereClause.eventId = eventId;
        }
        const recentAttendance = await this.attendanceRepository.find({
            where: whereClause,
            order: { checkInTime: 'DESC' },
            take: 10,
            relations: ['volunteer']
        });
        const recentAppsQuery = this.applicationRepository.createQueryBuilder('application')
            .leftJoinAndSelect('application.user', 'user')
            .where('application.status = :status', { status: application_status_enum_1.ApplicationStatus.APPROVED });
        if (eventId && eventId !== '' && eventId !== 'all') {
            recentAppsQuery.andWhere('application.eventId = :eventId', { eventId });
        }
        const recentApps = await recentAppsQuery
            .orderBy('application.updatedAt', 'DESC')
            .take(10)
            .getMany();
        const allRecent = [
            ...recentAttendance.map(a => ({
                id: a.id,
                name: a.volunteer?.name || 'Unknown',
                time: a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '',
                status: a.status,
                method: a.checkInMethod || 'manual',
                timestamp: a.checkInTime ? new Date(a.checkInTime).getTime() : 0
            })),
            ...recentApps.map(app => ({
                id: app.id,
                name: app.user.email.split('@')[0],
                time: new Date(app.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                status: 'present',
                method: 'online',
                timestamp: new Date(app.updatedAt).getTime()
            }))
        ];
        return allRecent
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 10);
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
                checkInTime: new Date(),
                checkInMethod: 'manual'
            });
        }
        else {
            attendance.status = 'present';
            attendance.checkInTime = new Date();
            attendance.checkInMethod = 'manual';
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
    async updateCheckIn(id, updateData) {
        const attendance = await this.attendanceRepository.findOne({ where: { id } });
        if (!attendance)
            throw new common_1.NotFoundException('Attendance record not found');
        Object.assign(attendance, updateData);
        return this.attendanceRepository.save(attendance);
    }
    async deleteCheckIn(id) {
        const result = await this.attendanceRepository.delete(id);
        if (result.affected === 0)
            throw new common_1.NotFoundException('Attendance record not found');
        return { success: true };
    }
    async getApplications() {
        const applications = await this.attendanceRepository.find({
            where: { status: 'absent' },
            order: { createdAt: 'DESC' },
            take: 5,
            relations: ['volunteer']
        });
        return applications.map(a => ({
            id: a.id,
            name: a.volunteer?.name || 'Unknown',
            role: a.volunteer?.role || 'Volunteer',
            event: a.eventId,
            time: this.getTimeAgo(a.createdAt),
            status: 'pending',
            createdAt: a.createdAt
        }));
    }
    getTimeAgo(date) {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1)
            return Math.floor(interval) + ' years ago';
        interval = seconds / 2592000;
        if (interval > 1)
            return Math.floor(interval) + ' months ago';
        interval = seconds / 86400;
        if (interval > 1)
            return Math.floor(interval) + ' days ago';
        interval = seconds / 3600;
        if (interval > 1)
            return Math.floor(interval) + ' hours ago';
        interval = seconds / 60;
        if (interval > 1)
            return Math.floor(interval) + ' minutes ago';
        return Math.floor(seconds) + ' seconds ago';
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __param(1, (0, typeorm_1.InjectRepository)(volunteer_entity_1.Volunteer)),
    __param(2, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map