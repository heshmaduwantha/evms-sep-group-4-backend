"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManualCheckinService = void 0;
const common_1 = require("@nestjs/common");
let ManualCheckinService = class ManualCheckinService {
    volunteers = [
        { id: '1', name: 'Sarah Mitchell', role: 'Team Lead', department: 'Operations', checkedIn: true, time: '08:02 AM' },
        { id: '2', name: 'James Okafor', role: 'Registration', department: 'Front Desk', checkedIn: true, time: '08:15 AM' },
        { id: '3', name: 'Priya Nair', role: 'Logistics', department: 'Operations', checkedIn: false, time: null },
        { id: '4', name: 'Carlos Reyes', role: 'Security', department: 'Safety', checkedIn: false, time: null },
        { id: '5', name: 'Amara Diallo', role: 'Hospitality', department: 'Guest Services', checkedIn: true, time: '07:58 AM' },
        { id: '6', name: 'Tom Whitfield', role: 'AV Tech', department: 'Technical', checkedIn: false, time: null },
        { id: '7', name: 'Yuki Tanaka', role: 'Volunteer', department: 'Operations', checkedIn: true, time: '08:05 AM' },
        { id: '8', name: 'Sofia Rodriguez', role: 'Volunteer', department: 'Front Desk', checkedIn: true, time: '08:10 AM' },
        { id: '9', name: 'Marcus Johnson', role: 'Volunteer', department: 'Technical', checkedIn: false, time: null },
        { id: '10', name: 'Elena Garcia', role: 'Team Lead', department: 'Operations', checkedIn: true, time: '08:20 AM' },
        { id: '11', name: 'David Chen', role: 'Volunteer', department: 'Safety', checkedIn: false, time: null },
        { id: '12', name: 'Leah Cohen', role: 'Volunteer', department: 'Guest Services', checkedIn: false, time: null },
        { id: '13', name: 'Michael Chen', role: 'Team Lead', department: 'Operations', checkedIn: true, time: '08:08 AM' },
        { id: '14', name: 'Emma Thompson', role: 'Volunteer', department: 'Front Desk', checkedIn: true, time: '08:25 AM' },
        { id: '15', name: 'David Kumar', role: 'Security', department: 'Safety', checkedIn: false, time: null },
        { id: '16', name: 'Alex Johnson', role: 'Volunteer', department: 'Technical', checkedIn: true, time: '08:18 AM' },
        { id: '17', name: 'Isabella Martinez', role: 'Volunteer', department: 'Guest Services', checkedIn: true, time: '07:55 AM' },
        { id: '18', name: 'Oliver Hassan', role: 'Team Lead', department: 'Operations', checkedIn: false, time: null },
        { id: '19', name: 'Jasmine Patel', role: 'Volunteer', department: 'Front Desk', checkedIn: true, time: '08:30 AM' },
        { id: '20', name: 'Lucas Anderson', role: 'AV Tech', department: 'Technical', checkedIn: false, time: null },
    ];
    getVolunteers(eventId, search, status) {
        let filtered = [...this.volunteers];
        if (search && search.trim()) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(v => v.name.toLowerCase().includes(searchLower) ||
                v.role.toLowerCase().includes(searchLower));
        }
        if (status === 'checked-in') {
            filtered = filtered.filter(v => v.checkedIn);
        }
        else if (status === 'absent') {
            filtered = filtered.filter(v => !v.checkedIn);
        }
        return {
            volunteers: filtered,
            total: this.volunteers.length,
            checkedIn: this.volunteers.filter(v => v.checkedIn).length,
        };
    }
    getCheckinSummary(eventId) {
        const checkedIn = this.volunteers.filter(v => v.checkedIn).length;
        return {
            total: this.volunteers.length,
            checkedIn,
            absent: this.volunteers.length - checkedIn,
            percentage: Math.round((checkedIn / this.volunteers.length) * 100),
        };
    }
    updateCheckin(volunteerId, updateCheckinDto) {
        const volunteer = this.volunteers.find(v => v.id === volunteerId);
        if (volunteer) {
            if (updateCheckinDto.checkedIn) {
                volunteer.checkedIn = true;
                volunteer.time = new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
            }
            else {
                volunteer.checkedIn = false;
                volunteer.time = null;
            }
        }
        return { success: true, volunteer };
    }
    markAbsent(volunteerId) {
        const volunteer = this.volunteers.find(v => v.id === volunteerId);
        if (volunteer) {
            volunteer.checkedIn = false;
            volunteer.time = null;
        }
        return { success: true, volunteer };
    }
    createAttendance(createAttendanceDto) {
        const newId = (Math.max(...this.volunteers.map(v => parseInt(v.id))) + 1).toString();
        const newAttendance = {
            id: newId,
            name: createAttendanceDto.name,
            role: createAttendanceDto.role,
            department: createAttendanceDto.department,
            checkedIn: createAttendanceDto.checkedIn || false,
            time: createAttendanceDto.time || (createAttendanceDto.checkedIn ? new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }) : null)
        };
        this.volunteers.push(newAttendance);
        return { success: true, volunteer: newAttendance };
    }
};
exports.ManualCheckinService = ManualCheckinService;
exports.ManualCheckinService = ManualCheckinService = __decorate([
    (0, common_1.Injectable)()
], ManualCheckinService);
//# sourceMappingURL=manual-checkin.service.js.map