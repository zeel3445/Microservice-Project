import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createVerifier } from 'fast-jwt';
import * as dayjs from 'dayjs';

@Injectable()
export class MemberMiddleware implements NestMiddleware {
  private verifier = createVerifier({
    key: process.env.JWT_SECRET || 'SECRET',
  });
  use(req: Request, res: Response, next: NextFunction): void {
    const token = req.headers['authorization'].split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    try {
      const decoded = this.verifier(token);
      if (decoded.exp < dayjs().unix()) {
        return null;
      } else {
        next();
      }
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
