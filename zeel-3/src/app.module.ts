import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomersModule } from './customers/customers.module';
import configuration from './configs/configuration';
import { ConfigModule } from '@nestjs/config';
import customerConfig from './configs/configuration';
import { CustomerMiddleware } from './middleware/customer.middleware';
import { AuthorizationGuard } from './Authorization-guard/authorization.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [customerConfig, configuration],
    }),
    CustomersModule,
  ],
  controllers: [AppController],
  providers: [AppService, CustomerMiddleware, AuthorizationGuard],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    console.log('hello');
    consumer
      .apply(CustomerMiddleware)
      .exclude(
        { path: 'customers', method: RequestMethod.POST },

        'cats/(.*)',
      )

      .forRoutes('customers');
  }
}
