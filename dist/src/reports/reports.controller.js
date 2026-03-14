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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../users/enums/role.enum");
let ReportsController = class ReportsController {
    reportsService;
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    getAttendanceReports(eventId, status, department, date) {
        console.log(`[ReportsController] getAttendanceReports - Query:`, { eventId, status, department, date });
        return this.reportsService.getAttendanceReports({
            eventId,
            status,
            department,
            date,
        });
    }
    getSummary(eventId, date) {
        console.log(`[ReportsController] getSummary - Query:`, { eventId, date });
        return this.reportsService.getSummary(eventId, date);
    }
    getByDepartment(eventId, date) {
        return this.reportsService.getByDepartment(eventId, date);
    }
    exportPDF(eventId) {
        return this.reportsService.generatePDFReport(eventId);
    }
    exportCSV(eventId) {
        return this.reportsService.generateCSVReport(eventId);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('attendance'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ORGANIZER, role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)('eventId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('department')),
    __param(3, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getAttendanceReports", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ORGANIZER, role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)('eventId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('by-department'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ORGANIZER, role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)('eventId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getByDepartment", null);
__decorate([
    (0, common_1.Get)('export/pdf'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ORGANIZER, role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "exportPDF", null);
__decorate([
    (0, common_1.Get)('export/csv'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ORGANIZER, role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "exportCSV", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map