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
let ReportsService = class ReportsService {
    volunteerRepository;
    attendanceRepository;
    constructor(volunteerRepository, attendanceRepository) {
        this.volunteerRepository = volunteerRepository;
        this.attendanceRepository = attendanceRepository;
    }
    async getAttendanceReports(filters) {
        const query = this.volunteerRepository.createQueryBuilder('volunteer')
            .leftJoinAndSelect('volunteer.attendances', 'attendance', 'attendance.eventId = :eventId', { eventId: filters.eventId });
        if (filters.department && filters.department !== 'all') {
            query.andWhere('volunteer.department = :department', { department: filters.department });
        }
        const volunteers = await query.getMany();
        let records = volunteers.map(v => {
            const attendance = v.attendances?.[0];
            return {
                id: v.id,
                name: v.name,
                role: v.role,
                dept: v.department,
                status: attendance ? attendance.status : 'absent',
                time: attendance?.checkInTime ? new Date(attendance.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : null,
            };
        });
        if (filters.status && filters.status !== 'all') {
            records = records.filter(r => r.status === filters.status);
        }
        return {
            records,
            totalRecords: records.length,
        };
    }
    async getSummary(eventId) {
        const total = await this.volunteerRepository.count();
        const attendances = await this.attendanceRepository.find({
            where: { eventId }
        });
        const present = attendances.filter(a => a.status === 'present').length;
        const late = attendances.filter(a => a.status === 'late').length;
        const absent = total - (present + late);
        const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
        return {
            total,
            present,
            late,
            absent,
            attendanceRate,
        };
    }
    async getByDepartment(eventId) {
        const volunteers = await this.volunteerRepository.find({
            relations: ['attendances']
        });
        const deptMap = new Map();
        volunteers.forEach(v => {
            const dept = v.department || 'Unassigned';
            if (!deptMap.has(dept)) {
                deptMap.set(dept, { department: dept, present: 0, late: 0, absent: 0, total: 0 });
            }
            const stats = deptMap.get(dept);
            stats.total++;
            const attendance = v.attendances?.find(a => a.eventId === eventId);
            if (attendance?.status === 'present') {
                stats.present++;
            }
            else if (attendance?.status === 'late') {
                stats.late++;
            }
            else {
                stats.absent++;
            }
        });
        return Array.from(deptMap.values());
    }
    async generatePDFReport(eventId) {
        const data = await this.getAttendanceReports({ eventId });
        const summary = await this.getSummary(eventId);
        return {
            success: true,
            data: {
                reportName: `Attendance Report - ${eventId}`,
                generatedAt: new Date().toISOString(),
                summary,
                records: data.records
            }
        };
    }
    async generateCSVReport(eventId) {
        const data = await this.getAttendanceReports({ eventId });
        let csv = 'Name,Role,Department,Status,Check-in Time\n';
        data.records.forEach(r => {
            csv += `"${r.name}","${r.role}","${r.dept}","${r.status}","${r.time || ''}"\n`;
        });
        return {
            success: true,
            message: 'CSV generated successfully',
            fileName: `attendance-report-${eventId}.csv`,
            content: csv
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(volunteer_entity_1.Volunteer)),
    __param(1, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map