import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { MembersService } from './members.service';
import { MemberDetailsDto } from 'src/dto/memberdetail.dto';

@Controller('members')
export class MembersController {
  constructor(private readonly memberdetailservice: MembersService) {}
  @Post('insert-memberdetails')
  async insertMemberDetails(
    @Body() memberdetaildto: MemberDetailsDto,
  ): Promise<any> {
    return await this.memberdetailservice.insertMemberDetails(memberdetaildto);
  }
  @Post('update-memberdetails')
  async updateMemberDetails(
    @Body() memberdetaildto: MemberDetailsDto,
  ): Promise<any> {
    return await this.memberdetailservice.updateMemberDetails(memberdetaildto);
  }
  @Delete('delete=memberdetails-by-id')
  async deleteMemberDetails(@Query('id') id: number): Promise<any> {
    return await this.memberdetailservice.deleteMemberDetails(id);
  }
  // @Throttle({})
  @Get('get-all-memberdetails')
  async getAllMemberDetails(): Promise<any> {
    return await this.memberdetailservice.getAllMemberDetails();
  }
  @Get('get-memberdetails-by-id')
  async getMemberDetailsById(@Query('id') id: number): Promise<any> {
    return await this.memberdetailservice.getMemberDetailsById(id);
  }
}
