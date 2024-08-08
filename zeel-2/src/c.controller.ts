import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { ClaimsDto } from 'src/dto/claims.dto';

@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimservice: ClaimsService) {}
  @Post('insert-claims')
  async insertClaims(@Body() claimdto: ClaimsDto): Promise<any> {
    return await this.claimservice.insertClaims(claimdto);
  }
  @Post('update-claims')
  async updateClaims(@Body() claimdto: ClaimsDto): Promise<any> {
    return await this.claimservice.updateClaims(claimdto);
  }
  @Delete('delete-claims-by-id')
  async deleteClaims(@Query('id') id: number): Promise<any> {
    return await this.claimservice.deleteClaims(id);
  }
  // @Throttle({})
  @Get('get-all-claims')
  async getAllClaims(): Promise<any> {
    return await this.claimservice.getAllClaims();
  }
  @Get('get-claims-by-id')
  async getClaimsById(@Query('id') id: number): Promise<any> {
    return await this.claimservice.getClaimsById(id);
  }
}
