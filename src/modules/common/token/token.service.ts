import * as crypto from 'crypto';

import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { token_type } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { TOKEN_EXPIRY } from './token.constants';

// TODO: escrever testes unitários de token.service
@Injectable()
export class TokenService {
	constructor(private readonly prisma: PrismaService) {}

	private hash(token: string): string {
		return crypto.createHash('sha256').update(token).digest('hex');
	}

	async create(accountId: string, type: token_type): Promise<string> {
		const rawToken = crypto.randomBytes(32).toString('hex');
		const hashedToken = this.hash(rawToken);

		const expiresAt = new Date();
		expiresAt.setSeconds(expiresAt.getSeconds() + TOKEN_EXPIRY[type]);

		await this.prisma.verification_token.create({
			data: {
				token: hashedToken,
				account_id: accountId,
				type,
				expires_at: expiresAt,
			},
		});

		return rawToken;
	}

	async validateAndConsume(
		rawToken: string,
		type: token_type,
	): Promise<string> {
		const hashedToken = this.hash(rawToken);

		return this.prisma.$transaction(async (tx) => {
			const record = await tx.verification_token.findUnique({
				where: { token: hashedToken },
			});

			if (!record) throw new Error('Invalid Token');
			if (record.type !== type) throw new Error('Invalid Token');
			if (record.used_at) throw new Error('Token already used');
			if (record.expires_at < new Date()) throw new Error('Expired Token');

			await tx.verification_token.update({
				where: { token: hashedToken },
				data: { used_at: new Date() },
			});

			return record.account_id;
		});
	}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async deleteInvalidTokens() {
		const deletedTokens = await this.prisma.verification_token.deleteMany({
			where: {
				expires_at: { lt: new Date() },
				used_at: { not: null },
			},
		});
		console.log(
			`CronJob::[TokenService/deleteInvalidTokens](${new Date().toISOString()}) -> ${deletedTokens.count} tokens deleted`,
		);
	}
}
