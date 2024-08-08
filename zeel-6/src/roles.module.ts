import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { PostgresService } from 'src/services/pg.service';

@Module({
  controllers: [RolesController],
  providers: [RolesService, PostgresService],
})
export class RolesModule {}
