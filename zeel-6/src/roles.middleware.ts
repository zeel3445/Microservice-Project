import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createVerifier } from 'fast-jwt';
import * as dayjs from 'dayjs';
import { FastifyRequest } from 'fastify';
import { RolesService } from 'src/roles/roles.service';
import { Pool } from 'pg';
import { PostgresService } from 'src/services/pg.service';
export interface IUserFastifyRequest extends FastifyRequest {
  user: any;
}

@Injectable()
export class RolesMiddleware implements NestMiddleware {
  rolesService: RolesService;
  constructor() {
    // this.rolesService = new RolesService();
  }
  async use(req: IUserFastifyRequest, res, next: () => void) {
    const access_token = req.headers['authorization'];

    // if (!access_token) {
    //   throw new BadRequestException('Not a access token');
    // }
    //     const rs: any = await this.rolesService
    //       .getUser(req, access_token as string, res)
    //       .catch((e) => {
    //         console.log(e);
    //       });
    //     if (rs) {
    //       req.user = rs.user;
    //     }
    //     next();
  }
}
//     try {
//       const decoded = this.verifier(token);
//       if (decoded.exp < dayjs().unix()) {
//         return null;
//       } else {
//         next();
//       }
//     } catch (e) {
//       throw new BadRequestException(e);
//     }
//   }
