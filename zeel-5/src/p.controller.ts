import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { PoliciesDto } from 'src/dto/policies.dto';
import { MessagePattern } from '@nestjs/microservices';
@Controller('policies')
export class PoliciesController {
  constructor(private readonly policyservice: PoliciesService) {}
  @MessagePattern({ cmd: 'get-policies-by-id' })
  async getPolicyForMembers(data: string): Promise<any> {
    const newdata = JSON.parse(data);
    console.log(newdata);
    const val = await this.policyservice.getPoliciesById(newdata.policiesid);
    console.log(val);
    return val;
  }
  @Post('insert-policies')
  async insertPolicies(@Body() policiesdto: PoliciesDto): Promise<any> {
    return await this.policyservice.insertPolicies(policiesdto);
  }
  @Post('update-policies')
  async updatePolicies(@Body() policiesdto: PoliciesDto): Promise<any> {
    return await this.policyservice.updatePolicies(policiesdto);
  }
  @Get('get-all-policies')
  async getAllPolicies(): Promise<any> {
    return await this.policyservice.getAllPolicies();
  }
  @Delete('delete-policies-by-id')
  async deletePolicies(@Query('id') id: number): Promise<any> {
    return await this.policyservice.deletePolicies(id);
  }

  @Get('get-policies-by-id')
  async getPolicyById(@Query('id') id: number): Promise<any> {
    return await this.policyservice.getPoliciesById(id);
  }
}
