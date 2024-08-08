import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);
  const authConfig = configService.get('authConfig');
  // console.log(policiesConfig.port.http_port_policies);
  app.connectMicroservice(
    {
      transport: Transport.TCP,
      options: {
        port: parseInt(authConfig.port.tcp_port_auths),
      },
    },
    { inheritAppConfig: true },
  );
  await app.startAllMicroservices();
  await app.listen(authConfig.port.http_port_auths);
}
bootstrap();
