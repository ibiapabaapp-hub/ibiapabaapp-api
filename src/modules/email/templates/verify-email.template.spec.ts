import { verifyEmailTemplate } from './verify-email.template';

describe('verifyEmailTemplate', () => {
	it('contains an encoded deep link with the verification token', () => {
		const token = 'token+/=?&';
		const html = verifyEmailTemplate(token);

		expect(html).toContain(
			`ibivibe:///auth/verify-email?token=${encodeURIComponent(token)}`,
		);
		expect(html).toContain('Confirmar meu e-mail');
		expect(html).toContain('Se não conseguir abrir o app, use este token:');
		expect(html).toContain(`<strong>${token}</strong>`);
		expect(html).toContain('O link expira em 24 horas.');
	});
});
