import { Inject, Injectable } from '@nestjs/common';

import {
	EMAIL_STRATEGY,
	type EmailStrategy,
} from './strategies/email-strategy.interface';
import { resetPasswordTemplate } from './templates/reset-password.template';
import { testEmailTemplate } from './templates/test.template';
import { verifyEmailTemplate } from './templates/verify-email.template';

// TODO: escrever testes unitários de email.service
@Injectable()
export class EmailService {
	constructor(
		@Inject(EMAIL_STRATEGY)
		private readonly strategy: EmailStrategy,
	) {}

	async sendVerificationEmail(to: string, token: string): Promise<void> {
		await this.strategy.send({
			to,
			subject: 'Confirme seu e-mail',
			html: verifyEmailTemplate(token),
		});
	}

	async sendPasswordResetEmail(to: string, token: string): Promise<void> {
		await this.strategy.send({
			to,
			subject: 'Recuperação de senha',
			html: resetPasswordTemplate(token),
		});
	}

	async sendTestEmail(to: string, token: string): Promise<void> {
		await this.strategy.send({
			to,
			subject: 'Teste de envio de e-mail',
			html: testEmailTemplate(token),
		});
	}

	async sendEmail(to: string, subject: string, html: string): Promise<void> {
		await this.strategy.send({
			to,
			subject,
			html,
		});
	}
}
