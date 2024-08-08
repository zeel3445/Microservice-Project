import { Module } from '@nestjs/common';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';
import { PostgresService } from 'src/services/pg.services';
import { ClaimsDto } from 'src/dto/claims.dto';

@Module({
  controllers: [ClaimsController],
  providers: [ClaimsService, PostgresService, ClaimsDto],
})
export class ClaimsModule {}
