import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);
  const memberConfig = configService.get('memberConfig');
  app.connectMicroservice(
    {
      transport: Transport.TCP,
      options: {
        port: parseInt(memberConfig.port.tcp_port_members),
      },
    },
    { inheritAppConfig: true },
  );
  await app.startAllMicroservices();

  await app.listen(memberConfig.port.http_port_members);
}
bootstrap();
