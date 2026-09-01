export function verifyEmailTemplate(token: string): string {
	const verificationLink = `ibivibe:///auth/verify-email?token=${encodeURIComponent(token)}`;

	return `
    <h2>Confirme seu e-mail</h2>
    <p>Toque no botão abaixo para confirmar seu e-mail no app:</p>
    <p><a href="${verificationLink}">Confirmar meu e-mail</a></p>
    <p>Se não conseguir abrir o app, use este token:</p>
    <p><strong>${token}</strong></p>
    <p>O link expira em 24 horas.</p>
  `;
}
