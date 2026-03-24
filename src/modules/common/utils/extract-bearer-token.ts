import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

export function extractBearerTokenFromReq(req: Request): string {
  const auth = req.headers.authorization;
  if (!auth) throw new UnauthorizedException('No authorization header');

  const [type, token] = auth.split(' ');

  if (type?.toLowerCase() !== 'bearer' || !token) {
    throw new UnauthorizedException('Invalid token format');
  }

  return token;
}

export function extractBearerTokenFromString(authorization: string): string {
  if (!authorization) {
    throw new UnauthorizedException();
  }

  const [type, token] = authorization.split(/\s+/);
  if (type !== 'Bearer' || !token) {
    throw new UnauthorizedException();
  }

  return token;
}
