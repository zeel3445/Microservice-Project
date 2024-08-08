import { Module } from '@nestjs/common';
import { PoliciesController } from './policies.controller';
import { PoliciesService } from './policies.service';
import { PostgresService } from 'src/services/pg.service';
import { PoliciesDto } from 'src/dto/policies.dto';

@Module({
  controllers: [PoliciesController],
  providers: [PoliciesService, PostgresService, PoliciesDto],
})
export class PoliciesModule {}
