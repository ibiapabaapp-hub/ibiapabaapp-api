import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { extractBearerTokenFromReq } from '../utils/extract-bearer-token';
import { JwtService } from '../jwt/jwt.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const token = extractBearerTokenFromReq(req);

    if (!token) {
      throw new UnauthorizedException(
        'Access token not provided, access forbidden',
      );
    }

    try {
      const payload = this.jwtService.verify<{ id: string; role: string }>(
        token,
      );
      req.user = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }
}
