import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { PostgresService } from 'src/services/pg.services';
import { MemberDetailsDto } from 'src/dto/memberdetail.dto';

@Module({
  controllers: [MembersController],
  providers: [MembersService, PostgresService, MemberDetailsDto],
})
export class MembersModule {}
