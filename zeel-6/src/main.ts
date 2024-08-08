import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);
  const rolesConfig = configService.get('rolesConfig');
  app.connectMicroservice(
    {
      transport: Transport.TCP,
      options: {
        port: parseInt(rolesConfig.port.tcp_port_roles),
      },
    },
    { inheritAppConfig: true },
  );
  await app.startAllMicroservices();
  await app.listen(rolesConfig.port.http_port_roles);
}
bootstrap();
