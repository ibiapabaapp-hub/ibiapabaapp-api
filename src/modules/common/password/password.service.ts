import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordService {
	async hashPassword(password: string): Promise<string> {
		if (!password) {
			throw new Error('Password string is required for hashing');
		}
		return argon2.hash(password);
	}

	async verifyPassword(hash: string, password: string): Promise<boolean> {
		if (!password) {
			throw new Error('Password string is required for verifying');
		}

		if (!hash) {
			throw new Error('Password hash is required for verifying');
		}

		return argon2.verify(hash, password);
	}
}
