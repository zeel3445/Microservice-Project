import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);
  const claimsConfig = configService.get('claimsConfig');
  // console.log(policiesConfig.port.http_port_policies);
  app.connectMicroservice(
    {
      transport: Transport.TCP,
      options: {
        port: parseInt(claimsConfig.port.tcp_port_claims),
      },
    },
    { inheritAppConfig: true },
  );
  await app.startAllMicroservices();
  await app.listen(claimsConfig.port.http_port_claims);
}

bootstrap();
