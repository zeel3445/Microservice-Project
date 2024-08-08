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
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const customers_module_1 = require("./customers/customers.module");
const configuration_1 = require("./configs/configuration");
const config_1 = require("@nestjs/config");
const configuration_2 = require("./configs/configuration");
const customer_middleware_1 = require("./middleware/customer.middleware");
const authorization_guard_1 = require("./Authorization-guard/authorization.guard");
let AppModule = class AppModule {
    configure(consumer) {
        console.log('hello');
        consumer
            .apply(customer_middleware_1.CustomerMiddleware)
            .exclude({ path: 'customers', method: common_1.RequestMethod.POST }, 'cats/(.*)')
            .forRoutes('customers');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
                load: [configuration_2.default, configuration_1.default],
            }),
            customers_module_1.CustomersModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, customer_middleware_1.CustomerMiddleware, authorization_guard_1.AuthorizationGuard],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map