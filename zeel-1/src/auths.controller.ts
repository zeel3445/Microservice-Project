import { Body, Controller, Post } from '@nestjs/common';
import { AuthDto } from 'src/dto/auth.dto';
import { AuthsService } from './auths.service';

@Controller('auths')
export class AuthsController {
  constructor(private readonly authservice: AuthsService) {}
  @Post('register-user')
  async register(@Body() authdto: AuthDto) {
    return this.authservice.register(authdto);
  }
  @Post('login-user')
  async login(@Body() authdto: AuthDto) {
    console.log('1');
    return this.authservice.login(authdto.username, authdto.password);
  }
}
