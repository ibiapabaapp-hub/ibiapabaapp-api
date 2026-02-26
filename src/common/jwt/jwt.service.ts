import { Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private SECRET_KEY = process.env.SECRET_KEY!;

  sign(data: object, options: jwt.SignOptions): string {
    return jwt.sign(data, this.SECRET_KEY, options);
  }

  verify<T = any>(token: string): T {
    try {
      return jwt.verify(token, this.SECRET_KEY) as T;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
