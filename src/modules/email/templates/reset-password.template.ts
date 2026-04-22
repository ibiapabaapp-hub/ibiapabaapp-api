export function resetPasswordTemplate(token: string): string {
	return `
    <h2>Recuperação de senha</h2>
    <p>Utilize o código abaixo para redefinir sua senha:</p>
    <p><strong>${token}</strong></p>
    <p>O link expira em 1 hora. Se não foi você, ignore este e-mail.</p>
  `;
}
