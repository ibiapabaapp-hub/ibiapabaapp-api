import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import { resetPasswordTemplate } from './templates/reset-password.template';
import { testEmailTemplate } from './templates/test.template';
import { verifyEmailTemplate } from './templates/verify-email.template';

@Injectable()
export class EmailService {
	private readonly resend: Resend;
	private readonly from: string;
	private readonly logger = new Logger(EmailService.name);

	constructor(private readonly config: ConfigService) {
		const apiKey = config.getOrThrow('RESEND_API_KEY');
		const from = config.getOrThrow('EMAIL_FROM');

		this.resend = new Resend(apiKey);
		this.from = from;
	}

	private async send(payload: { to: string; subject: string; html: string }): Promise<void> {
		const { error } = await this.resend.emails.send({
			from: this.from,
			...payload,
		});

		if (error) {
			this.logger.error(`Resend error: ${error.message}`);
			throw new Error(`Failed to send email: ${error.message}`);
		}
	}

	async sendVerificationEmail(to: string, token: string): Promise<void> {
		await this.send({
			to,
			subject: 'Confirme seu e-mail',
			html: verifyEmailTemplate(token),
		});
	}

	async sendPasswordResetEmail(to: string, token: string): Promise<void> {
		await this.send({
			to,
			subject: 'Recuperação de senha',
			html: resetPasswordTemplate(token),
		});
	}

	async sendTestEmail(to: string, token: string): Promise<void> {
		await this.send({
			to,
			subject: 'Teste de envio de e-mail',
			html: testEmailTemplate(token),
		});
	}

	async sendEmail(to: string, subject: string, html: string): Promise<void> {
		await this.send({ to, subject, html });
	}
}
