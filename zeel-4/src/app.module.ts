import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MembersModule } from './members/members.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './configs/configuration';
import memberConfig from './configs/configuration';
import { MemberMiddleware } from './middleware/member.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration, memberConfig],
    }),
    MembersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MemberMiddleware).forRoutes('members');
  }
}
