"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const microservices_1 = require("@nestjs/microservices");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const policiesConfig = configService.get('policiesConfig');
    app.connectMicroservice({
        transport: microservices_1.Transport.TCP,
        options: {
            port: parseInt(policiesConfig.port.tcp_port_polcies),
        },
    }, { inheritAppConfig: true });
    await app.startAllMicroservices();
    await app.listen(policiesConfig.port.http_port_policies);
}
bootstrap();
//# sourceMappingURL=main.js.map