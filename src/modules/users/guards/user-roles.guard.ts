import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { UserRoles } from '../../common/decorators/user-roles.decorator';
import { JwtService } from '../../common/jwt/jwt.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const acceptedRoles = this.reflector.get(UserRoles, context.getHandler());
    if (!acceptedRoles) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    const user = this.jwtService.verify<{ id: string; role: string }>(token);
    const isAccessGranted = acceptedRoles.includes(user.role);

    if (isAccessGranted) {
      return true;
    }

    throw new ForbiddenException(
      'User not authorized to access this resource',
      {
        cause: `User with id ${user.id} and role ${user.role}, tried to request resource ${request.url}`,
      },
    );
  }
}
