import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);
  const policiesConfig = configService.get('policiesConfig');
  // console.log(policiesConfig.port.http_port_policies);
  app.connectMicroservice(
    {
      transport: Transport.TCP,
      options: {
        port: parseInt(policiesConfig.port.tcp_port_polcies),
      },
    },
    { inheritAppConfig: true },
  );
  await app.startAllMicroservices();
  await app.listen(policiesConfig.port.http_port_policies);
}
bootstrap();
