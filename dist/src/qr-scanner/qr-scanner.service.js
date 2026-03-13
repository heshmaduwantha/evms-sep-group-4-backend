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
exports.QrScannerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const attendance_entity_1 = require("../attendance/entities/attendance.entity");
const volunteer_entity_1 = require("../users/entities/volunteer.entity");
let QrScannerService = class QrScannerService {
    volunteerRepository;
    attendanceRepository;
    constructor(volunteerRepository, attendanceRepository) {
        this.volunteerRepository = volunteerRepository;
        this.attendanceRepository = attendanceRepository;
    }
    async processScan(qrCode, eventId) {
        const volunteer = await this.volunteerRepository.findOne({ where: { qrCode } });
        const scannedCount = await this.attendanceRepository.count({
            where: { eventId, status: 'present' }
        });
        if (!volunteer) {
            return {
                success: false,
                message: 'Volunteer QR code not found',
                scannedCount
            };
        }
        let attendance = await this.attendanceRepository.findOne({
            where: { volunteer: { id: volunteer.id }, eventId }
        });
        if (attendance && attendance.status === 'present') {
            return {
                success: false,
                message: 'Volunteer already checked in',
                volunteer: { name: volunteer.name },
                scannedCount
            };
        }
        if (!attendance) {
            attendance = this.attendanceRepository.create({
                volunteer,
                eventId,
            });
        }
        attendance.status = 'present';
        attendance.checkInTime = new Date();
        await this.attendanceRepository.save(attendance);
        return {
            success: true,
            message: `${volunteer.name} checked in successfully`,
            volunteer: { name: volunteer.name },
            scannedCount: scannedCount + 1
        };
    }
    async getSessionStats(eventId) {
        const scannedCount = await this.attendanceRepository.count({
            where: { eventId, status: 'present' }
        });
        return {
            scanned: scannedCount,
            successRate: 98
        };
    }
    async getRecentScans(eventId) {
        const recent = await this.attendanceRepository.find({
            where: { eventId, status: 'present' },
            order: { checkInTime: 'DESC' },
            take: 10,
            relations: ['volunteer']
        });
        return recent.map(a => ({
            id: a.id,
            volunteerId: a.volunteer?.id || 'Unknown',
            name: a.volunteer?.name || 'Unknown',
            time: a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '',
            status: 'success'
        }));
    }
};
exports.QrScannerService = QrScannerService;
exports.QrScannerService = QrScannerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(volunteer_entity_1.Volunteer)),
    __param(1, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], QrScannerService);
//# sourceMappingURL=qr-scanner.service.js.map