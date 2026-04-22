export function verifyEmailTemplate(token: string): string {
	return `
    <h2>Confirme seu e-mail</h2>
    <p>Copie e cole o código abaixo para confirmar seu e-mail:</p>
    <p><strong>${token}</strong></p>
    <p>O link expira em 24 horas.</p>
  `;
}
