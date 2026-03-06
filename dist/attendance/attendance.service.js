"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
let AttendanceService = class AttendanceService {
    mockAttendanceData = {
        'event-1': {
            totalVolunteers: 142,
            checkedIn: 98,
            lateArrivals: 14,
            absent: 30,
            attendanceRate: 69
        }
    };
    mockRosterData = {
        'event-1': [
            { id: '1', name: 'Sarah Mitchell', role: 'Team Lead', status: 'present', checkedInTime: '08:30 AM' },
            { id: '2', name: 'James Okafor', role: 'Registration', status: 'present', checkedInTime: '08:45 AM' },
            { id: '3', name: 'Michael Chen', role: 'Volunteer', status: 'present', checkedInTime: '08:50 AM' },
            { id: '4', name: 'Emma Thompson', role: 'Volunteer', status: 'late', checkedInTime: '09:15 AM' },
            { id: '5', name: 'David Kumar', role: 'Team Lead', status: 'absent', checkedInTime: null },
            { id: '6', name: 'Priya Nair', role: 'Logistics', status: 'present', checkedInTime: '08:35 AM' },
            { id: '7', name: 'Carlos Reyes', role: 'Security', status: 'absent', checkedInTime: null },
            { id: '8', name: 'Amara Diallo', role: 'Hospitality', status: 'present', checkedInTime: '08:20 AM' },
            { id: '9', name: 'Tom Whitfield', role: 'AV Tech', status: 'late', checkedInTime: '09:10 AM' },
            { id: '10', name: 'Yuki Tanaka', role: 'Volunteer', status: 'present', checkedInTime: '08:05 AM' },
            { id: '11', name: 'Sofia Rodriguez', role: 'Volunteer', status: 'present', checkedInTime: '08:12 AM' },
            { id: '12', name: 'Alex Johnson', role: 'Volunteer', status: 'present', checkedInTime: '08:18 AM' },
            { id: '13', name: 'Marcus Johnson', role: 'Volunteer', status: 'present', checkedInTime: '08:40 AM' },
            { id: '14', name: 'Elena Garcia', role: 'Team Lead', status: 'present', checkedInTime: '08:25 AM' },
            { id: '15', name: 'David Chen', role: 'Volunteer', status: 'absent', checkedInTime: null },
            { id: '16', name: 'Leah Cohen', role: 'Volunteer', status: 'present', checkedInTime: '08:55 AM' }
        ]
    };
    mockRecentCheckIns = {
        'event-1': [
            { id: '1', name: 'Yuki Tanaka', time: '08:05 AM', status: 'present' },
            { id: '2', name: 'Sofia Rodriguez', time: '08:10 AM', status: 'present' },
            { id: '3', name: 'Alex Johnson', time: '08:15 AM', status: 'present' },
            { id: '4', name: 'Amara Diallo', time: '08:20 AM', status: 'present' },
            { id: '5', name: 'Elena Garcia', time: '08:25 AM', status: 'present' },
            { id: '6', name: 'Sarah Mitchell', time: '08:30 AM', status: 'present' },
            { id: '7', name: 'Priya Nair', time: '08:35 AM', status: 'present' },
            { id: '8', name: 'Marcus Johnson', time: '08:40 AM', status: 'present' }
        ]
    };
    getAttendanceOverview(eventId) {
        return this.mockAttendanceData[eventId] || {
            totalVolunteers: 0,
            checkedIn: 0,
            lateArrivals: 0,
            absent: 0,
            attendanceRate: 0
        };
    }
    getVolunteerRoster(eventId) {
        return this.mockRosterData[eventId] || [];
    }
    getRecentCheckIns(eventId) {
        return this.mockRecentCheckIns[eventId] || [];
    }
    checkIn(data) {
        return {
            success: true,
            message: 'Check-in successful',
            timestamp: new Date().toISOString()
        };
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)()
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map