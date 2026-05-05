import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import { EmailStrategy, SendEmailPayload } from './email-strategy.interface';

// TODO: escrever testes unitários de resend.strategy
@Injectable()
export class ResendStrategy implements EmailStrategy {
	private readonly resend: Resend;
	private readonly from: string;
	private readonly logger = new Logger(ResendStrategy.name);

	constructor(private readonly config: ConfigService) {
		const apiKey = config.getOrThrow('RESEND_API_KEY');
		const from = config.getOrThrow('EMAIL_FROM');

		this.resend = new Resend(apiKey);
		this.from = from;
	}

	async send({ to, subject, html }: SendEmailPayload): Promise<void> {
		const { error } = await this.resend.emails.send({
			from: this.from,
			to,
			subject,
			html,
		});

		if (error) {
			this.logger.error(`Resend error: ${error.message}`);
			throw new Error(`Failed to send email: ${error.message}`);
		}
	}
}
