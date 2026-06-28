export function testEmailTemplate(token: string): string {
	return `
    <h2>Olá, do IbiVibe!</h2>
    <p>Teste de envio de e-mail com token :D</p>
    <p><strong>${token}</strong></p>
  `;
}
