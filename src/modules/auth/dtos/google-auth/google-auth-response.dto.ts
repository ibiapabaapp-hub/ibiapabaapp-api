import { SecureAccountDTO } from 'src/modules/accounts/dtos/secure-account-dto';

// Retorno quando o usuário já existe
export class GoogleAuthExistingResponseDto {
	is_new_user: false;
	account: SecureAccountDTO;
	access_token: string;
	refresh_token: string;
}

// Retorno quando o usuário é NOVO (precisa completar onboarding)
export class GoogleAuthNewUserResponseDto {
	is_new_user: true;
	tempToken: string; // JWT de curta duração (15min) com dados do Google
	email: string; // para exibir na tela de onboarding
	name: string; // sugestão de display_name
	avatar_url?: string; // foto do Google para pré-preencher
}
