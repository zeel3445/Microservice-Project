import { Body, Controller, Post } from '@nestjs/common';
import { RolesDto } from 'src/dto/roles.dto';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesservice: RolesService) {}
  @Post('register-user-role')
  async register(@Body() roledto: RolesDto): Promise<any> {
    return await this.rolesservice.register(roledto);
  }
}
