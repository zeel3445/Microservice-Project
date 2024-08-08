import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PoliciesModule } from './policies/policies.module';
import configuration from './configs/configuration';
import { ConfigModule } from '@nestjs/config';
import policiesConfig from './configs/configuration';
import { PoliciesMiddleware } from './middleware/policies-middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration, policiesConfig],
    }),
    PoliciesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PoliciesMiddleware).forRoutes('policies');
  }
}
