"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrScannerModule = void 0;
const common_1 = require("@nestjs/common");
const qr_scanner_controller_1 = require("./qr-scanner.controller");
const qr_scanner_service_1 = require("./qr-scanner.service");
let QrScannerModule = class QrScannerModule {
};
exports.QrScannerModule = QrScannerModule;
exports.QrScannerModule = QrScannerModule = __decorate([
    (0, common_1.Module)({
        controllers: [qr_scanner_controller_1.QrScannerController],
        providers: [qr_scanner_service_1.QrScannerService],
        exports: [qr_scanner_service_1.QrScannerService],
    })
], QrScannerModule);
//# sourceMappingURL=qr-scanner.module.js.map