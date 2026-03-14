"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const attendance_module_1 = require("./attendance/attendance.module");
const reports_module_1 = require("./reports/reports.module");
const manual_checkin_module_1 = require("./manual-checkin/manual-checkin.module");
const user_entity_1 = require("./users/entities/user.entity");
const volunteer_entity_1 = require("./users/entities/volunteer.entity");
const attendance_entity_1 = require("./attendance/entities/attendance.entity");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply((req, res, next) => {
            const { method, url } = req;
            const auth = req.headers.authorization ? 'Present' : 'Missing';
            res.on('finish', () => {
                const { statusCode } = res;
                console.log(`[Request] ${method} ${url} - Status: ${statusCode} - Auth: ${auth}`);
            });
            next();
        })
            .forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('PG_DB_HOST'),
                    port: configService.get('PG_DB_PORT'),
                    username: configService.get('PG_DB_USER'),
                    password: configService.get('PG_DB_PASSWORD'),
                    database: configService.get('PG_DB_NAME'),
                    entities: [user_entity_1.User, volunteer_entity_1.Volunteer, attendance_entity_1.Attendance],
                    synchronize: true,
                }),
                inject: [config_1.ConfigService],
            }),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            attendance_module_1.AttendanceModule,
            reports_module_1.ReportsModule,
            manual_checkin_module_1.ManualCheckinModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map