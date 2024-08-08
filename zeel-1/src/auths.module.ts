import { Module } from '@nestjs/common';
import { AuthsController } from './auths.controller';
import { AuthsService } from './auths.service';
import { PostgresService } from 'src/services/pg.service';
import { AuthDto } from 'src/dto/auth.dto';

@Module({
  controllers: [AuthsController],
  providers: [AuthsService, PostgresService, AuthDto],
})
export class AuthsModule {}
