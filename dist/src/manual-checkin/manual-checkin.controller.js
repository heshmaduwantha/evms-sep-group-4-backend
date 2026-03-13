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
exports.ManualCheckinController = void 0;
const common_1 = require("@nestjs/common");
const manual_checkin_service_1 = require("./manual-checkin.service");
const update_checkin_dto_1 = require("./dto/update-checkin.dto");
const create_attendance_dto_1 = require("./dto/create-attendance.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../users/enums/role.enum");
let ManualCheckinController = class ManualCheckinController {
    manualCheckinService;
    constructor(manualCheckinService) {
        this.manualCheckinService = manualCheckinService;
    }
    getVolunteers(eventId, search, status) {
        console.log(`[ManualCheckinController] getVolunteers - eventId: ${eventId}, search: ${search}, status: ${status}`);
        return this.manualCheckinService.getVolunteers(eventId, search, status);
    }
    updateCheckin(eventId, volunteerId, updateCheckinDto) {
        return this.manualCheckinService.updateCheckin(volunteerId, eventId, updateCheckinDto);
    }
    createAttendance(eventId, createAttendanceDto) {
        console.log(`[ManualCheckinController] createAttendance - eventId: ${eventId}`, createAttendanceDto);
        return this.manualCheckinService.createAttendance(eventId, createAttendanceDto);
    }
    getCheckinSummary(eventId) {
        return this.manualCheckinService.getCheckinSummary(eventId);
    }
    markAbsent(eventId, volunteerId) {
        return this.manualCheckinService.markAbsent(volunteerId, eventId);
    }
    updateVolunteer(id, updateDto) {
        return this.manualCheckinService.updateVolunteer(id, updateDto);
    }
    deleteVolunteer(id) {
        return this.manualCheckinService.deleteVolunteer(id);
    }
};
exports.ManualCheckinController = ManualCheckinController;
__decorate([
    (0, common_1.Get)('volunteers/:eventId'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ORGANIZER, role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ManualCheckinController.prototype, "getVolunteers", null);
__decorate([
    (0, common_1.Put)('checkin/:eventId/:volunteerId'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ORGANIZER, role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Param)('volunteerId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_checkin_dto_1.UpdateCheckinDto]),
    __metadata("design:returntype", void 0)
], ManualCheckinController.prototype, "updateCheckin", null);
__decorate([
    (0, common_1.Post)('create/:eventId'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ORGANIZER, role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_attendance_dto_1.CreateAttendanceDto]),
    __metadata("design:returntype", void 0)
], ManualCheckinController.prototype, "createAttendance", null);
__decorate([
    (0, common_1.Get)('summary/:eventId'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ORGANIZER, role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ManualCheckinController.prototype, "getCheckinSummary", null);
__decorate([
    (0, common_1.Put)('mark-absent/:eventId/:volunteerId'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ORGANIZER, role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Param)('volunteerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ManualCheckinController.prototype, "markAbsent", null);
__decorate([
    (0, common_1.Post)('volunteer/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ORGANIZER, role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ManualCheckinController.prototype, "updateVolunteer", null);
__decorate([
    (0, common_1.Delete)('volunteer/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ORGANIZER, role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ManualCheckinController.prototype, "deleteVolunteer", null);
exports.ManualCheckinController = ManualCheckinController = __decorate([
    (0, common_1.Controller)('manual-checkin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [manual_checkin_service_1.ManualCheckinService])
], ManualCheckinController);
//# sourceMappingURL=manual-checkin.controller.js.map