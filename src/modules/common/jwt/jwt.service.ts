import { Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
	private readonly SECRET_KEY = process.env.SECRET_KEY!;

	sign(data: object, options: jwt.SignOptions, secretKey?: string): string {
		return jwt.sign(data, secretKey ? secretKey : this.SECRET_KEY, options);
	}

	verify<T = any>(token?: string, secretKey?: string): T {
		try {
			if (!token) throw new UnauthorizedException();
			return jwt.verify(token, secretKey ? secretKey : this.SECRET_KEY) as T;
		} catch {
			throw new UnauthorizedException('Invalid or expired token');
		}
	}
}
