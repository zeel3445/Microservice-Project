import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const reflector = new Reflector();
    console.log('incan activate');
    const feature: any = reflector.get<string[]>(
      'customer',
      context.getHandler(),
    );
    console.log(feature);
    // if (!feature) return true;
    const request = context.switchToHttp().getRequest();

    const user = request.user;
    console.log(user);
    if (!user) {
      return false;
    }
    const canActivate = false;
    if (!canActivate) console.log('User not authorized');
    return canActivate;
  }
}
