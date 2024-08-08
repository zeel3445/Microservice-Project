"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const microservices_1 = require("@nestjs/microservices");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const customerConfig = configService.get('customerConfig');
    app.connectMicroservice({
        transport: microservices_1.Transport.TCP,
        options: {
            port: parseInt(customerConfig.port.tcp_port_customers),
        },
    }, { inheritAppConfig: true });
    await app.startAllMicroservices();
    await app.listen(customerConfig.port.http_port_customers);
}
bootstrap();
//# sourceMappingURL=main.js.map