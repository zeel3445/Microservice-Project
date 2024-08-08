import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { hash, compare } from 'bcrypt';
import { Pool } from 'pg';
import { AuthDto } from 'src/dto/auth.dto';
import { UserModel } from 'src/models/auth.models';
import { PostgresService } from 'src/services/pg.service';

import { createJwtPayload } from './jwt.interface';
import { createSigner } from 'fast-jwt';
import { get, redisClient } from 'src/services/redis.service';
import { error } from 'console';
import { Payload } from '@nestjs/microservices';

@Injectable()
export class AuthsService {
  private signer = createSigner({
    key: process.env.JWT_SECRET || 'SECRET',
    expiresIn: 10000000000,
  });

  pool: Pool;
  constructor(private readonly postgress: PostgresService) {
    this.pool = this.postgress.pool;
  }
  async register(authdto: AuthDto): Promise<any> {
    const exis = await UserModel.getuserByUsername(
      this.pool,
      authdto.username,
    ).catch((e) => {
      console.log(e);
      throw new BadRequestException(e);
    });
    if (exis) {
      const val = `user with username=${authdto.username} already exist`;
      return val;
    }
    const val = await UserModel.build(authdto);
    const hashedPassword = await hash(authdto.password, 10);
    val.password = hashedPassword;
    await val.save(this.pool);
    return val;
  }
  catch(error) {
    throw error;
  }
  async login(username: string, password: string): Promise<any> {
    console.log('2');
    const user = await this.validateUser(username, password);
    if (!user) {
      const err = 'Invalid credentials';
      throw new UnauthorizedException(err);
    }
    const k = await redisClient.get(`username:${username}`);
    const val = JSON.parse(k);
    user.roleId = val.RoleId;

    const payload = createJwtPayload(user);
    console.log(payload);
    return {
      access_token: this.signer(payload),
    };
  }
  async validateUser(username: string, password: string): Promise<any> {
    let user;

    console.log('3');
    user = await this.findOne(username);
    if (user == null) {
      console.log('7');
      const Payload = { username, password };
      console.log(password, username);
      console.log(Payload);
      user = this.register(Payload);
      return user;
    }

    console.log('8');

    console.log(password, user.password);
    if (user && (await this.comparePasswords(password, user.password))) {
      return user;
    }
    return null;
  }
  async findOne(username: string): Promise<any | undefined> {
    console.log('4');
    const user = await UserModel.getuserByUsername(this.pool, username);
    console.log('6');
    return user;
  }
  async comparePasswords(
    password: string,
    hashedPassword: any,
  ): Promise<boolean> {
    try {
      const val = await compare(password, hashedPassword);
      return val;
    } catch (error) {
      console.error('Error in comparePasswords:', error);
      const err = 'Failed to compare passwords';
      throw new BadRequestException(err);
    }
  }
}
