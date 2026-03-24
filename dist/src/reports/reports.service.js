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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const attendance_entity_1 = require("../attendance/entities/attendance.entity");
const volunteer_entity_1 = require("../users/entities/volunteer.entity");
const application_entity_1 = require("../applications/entities/application.entity");
const application_status_enum_1 = require("../applications/enums/application-status.enum");
let ReportsService = class ReportsService {
    volunteerRepository;
    attendanceRepository;
    applicationRepository;
    constructor(volunteerRepository, attendanceRepository, applicationRepository) {
        this.volunteerRepository = volunteerRepository;
        this.attendanceRepository = attendanceRepository;
        this.applicationRepository = applicationRepository;
    }
    async getAttendanceReports(filters) {
        const { eventId, date, status, department } = filters;
        console.log(`[ReportsService] getAttendanceReports - Filters: eventId=${eventId}, date=${date}, status=${status}, department=${department}`);
        const findOptions = {
            relations: ['attendances'],
        };
        if (department && department !== 'all') {
            findOptions.where = { department: department };
        }
        const volunteers = await this.volunteerRepository.find(findOptions);
        const appQuery = this.applicationRepository.createQueryBuilder('application')
            .leftJoinAndSelect('application.user', 'user')
            .leftJoinAndSelect('application.event', 'event')
            .where('application.status = :status', { status: application_status_enum_1.ApplicationStatus.APPROVED });
        if (eventId && eventId !== '') {
            appQuery.andWhere('application.eventId = :eventId', { eventId });
        }
        const approvedApps = await appQuery.getMany();
        let records = [];
        volunteers.forEach(v => {
            let attendances = v.attendances || [];
            if (eventId && eventId !== '' && eventId !== 'all') {
                attendances = attendances.filter(a => a.eventId === eventId);
            }
            if (attendances.length === 0) {
                records.push({
                    id: v.id,
                    name: v.name,
                    role: v.role,
                    dept: v.department,
                    status: 'absent',
                    time: null,
                    method: 'manual',
                    eventId: eventId || 'None'
                });
            }
            else {
                attendances.forEach(a => {
                    if (date && date !== '') {
                        const checkInDate = a.checkInTime ? new Date(a.checkInTime).toISOString().split('T')[0] : null;
                        if (checkInDate !== date)
                            return;
                    }
                    records.push({
                        id: v.id,
                        name: v.name,
                        role: v.role,
                        dept: v.department,
                        status: a.status,
                        time: a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : null,
                        method: a.checkInMethod || 'manual',
                        eventId: a.eventId
                    });
                });
            }
        });
        approvedApps.forEach(app => {
            if (date && date !== '') {
                const appDate = new Date(app.updatedAt).toISOString().split('T')[0];
                if (appDate !== date)
                    return;
            }
            const name = app.user.email.split('@')[0];
            const exists = records.find(r => r.name === name && r.eventId === app.event.id);
            if (!exists) {
                records.push({
                    id: app.id,
                    name: name,
                    role: 'Volunteer',
                    dept: 'Portal',
                    status: 'present',
                    time: new Date(app.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                    method: 'online',
                    eventId: app.event.id
                });
            }
        });
        if (!eventId || eventId === '' || eventId === 'all') {
            const consolidated = [];
            const seenNames = new Set();
            const sorted = records.sort((a, b) => {
                const aVal = (a.status === 'present' || a.status === 'late') ? 1 : 0;
                const bVal = (b.status === 'present' || b.status === 'late') ? 1 : 0;
                return bVal - aVal;
            });
            sorted.forEach(r => {
                const lowerName = r.name.toLowerCase();
                if (!seenNames.has(lowerName)) {
                    seenNames.add(lowerName);
                    consolidated.push(r);
                }
            });
            records = consolidated;
        }
        if (status && status !== 'all') {
            records = records.filter(r => r.status === status);
        }
        return {
            records,
            totalRecords: records.length,
        };
    }
    async getSummary(eventId, date) {
        const data = await this.getAttendanceReports({ eventId, date });
        const records = data.records;
        const total = records.length;
        const present = records.filter(r => r.status === 'present').length;
        const late = records.filter(r => r.status === 'late').length;
        const absent = records.filter(r => r.status === 'absent').length;
        const manualCheckedIn = records.filter(r => r.method === 'manual' && (r.status === 'present' || r.status === 'late')).length;
        const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
        return {
            total,
            present,
            late,
            absent,
            attendanceRate,
            manualCheckedIn,
        };
    }
    async getByDepartment(eventId, date) {
        const data = await this.getAttendanceReports({ eventId, date });
        const records = data.records;
        const deptMap = new Map();
        records.forEach(r => {
            const dept = r.dept || 'Unassigned';
            if (!deptMap.has(dept)) {
                deptMap.set(dept, { department: dept, present: 0, late: 0, absent: 0, total: 0 });
            }
            const stats = deptMap.get(dept);
            stats.total++;
            if (r.status === 'present') {
                stats.present++;
            }
            else if (r.status === 'late') {
                stats.late++;
            }
            else {
                stats.absent++;
            }
        });
        return Array.from(deptMap.values());
    }
    async generatePDFReport(eventId, eventTitle) {
        const data = await this.getAttendanceReports({ eventId });
        const summary = await this.getSummary(eventId);
        let reportName = `Attendance Report - ${eventId}`;
        if (eventTitle) {
            reportName = eventTitle === 'All Events' ? 'Attendance Report - All Events' : `Volunteers for ${eventTitle} Event`;
        }
        return {
            success: true,
            data: {
                reportName,
                generatedAt: new Date().toISOString(),
                summary,
                records: data.records
            }
        };
    }
    async generateCSVReport(eventId, eventTitle) {
        const data = await this.getAttendanceReports({ eventId });
        let csv = 'Name,Role,Department,Status,Check-in Time,Method\n';
        data.records.forEach(r => {
            csv += `"${r.name}","${r.role}","${r.dept}","${r.status}","${r.time || ''}","${r.method}"\n`;
        });
        let fileName = `attendance-report-${eventId}.csv`;
        if (eventTitle) {
            const slug = eventTitle.toLowerCase().replace(/\s+/g, '-');
            fileName = eventTitle === 'All Events' ? 'attendance-report-all-events.csv' : `volunteers-for-${slug}.csv`;
        }
        return {
            success: true,
            message: 'CSV generated successfully',
            fileName,
            content: csv
        };
    }
    async getRawData() {
        const volunteers = await this.volunteerRepository.find();
        const attendances = await this.attendanceRepository.find();
        return { volunteers, attendances };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(volunteer_entity_1.Volunteer)),
    __param(1, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __param(2, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map