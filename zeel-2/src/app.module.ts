import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClaimsModule } from './claims/claims.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './configs/configuration';
import claimsConfig from './configs/configuration';
import { ClaimsMiddleware } from './middleware/claims.middleware';

@Module({
  imports: [
    ClaimsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration, claimsConfig],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ClaimsMiddleware).forRoutes('claims');
  }
}
