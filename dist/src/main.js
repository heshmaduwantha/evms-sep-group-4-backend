"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('--- TOP OF main.ts ---');
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    console.log('Starting bootstrap...');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    console.log('NestFactory.create finished.');
    app.enableCors();
    const port = process.env.APP_PORT || 3200;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map