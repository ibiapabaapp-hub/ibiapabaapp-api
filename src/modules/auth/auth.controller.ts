import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiHeader,
	ApiOperation,
	ApiQuery,
	ApiResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from 'src/modules/common/decorators/public.decorator';

import { SecureAccountDTO } from '../accounts/dtos/secure-account-dto';
import { AuthService } from './auth.service';
import { CheckUniqueDto } from './dtos/check-unique-field.dto';
import { GoogleAuthCompleteDto } from './dtos/google-auth/google-auth-complete.dto';
import { GoogleAuthDto } from './dtos/google-auth/google-auth.dto';
import { AuthResponseDto } from './dtos/manual-auth/auth-response.dto';
import { LoginDto } from './dtos/manual-auth/login.dto';
import { RegisterDto } from './dtos/manual-auth/register.dto';
import { SuccessResponseDTO } from './dtos/success-response.dto';
import { GoogleOAuthService } from './oauth/google-oauth.service';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly googleOAuthService: GoogleOAuthService,
	) {}

	@ApiOperation({
		summary: 'Realizar login',
		description: 'Retorna tokens de acesso e dados da conta',
	})
	@ApiResponse({
		status: 200,
		description: 'Login realizado com sucesso',
		type: AuthResponseDto,
	})
	@ApiResponse({ status: 401, description: 'Credenciais inválidas' })
	@Post('login')
	@Public()
	@Throttle({
		default: { limit: 5, ttl: 900000 }, // 5 tentativas a cada 15 minutos
	})
	async login(@Body() loginDto: LoginDto) {
		const authData = await this.authService.login(loginDto);

		// for web
		// response.cookie('refresh_token', authData.refresh_token, {
		//   httpOnly: true,
		//   sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
		//   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
		//   secure: process.env.NODE_ENV === 'production' ? true : false,
		// });

		return {
			account: authData.account,
			access_token: authData.access_token,
			refresh_token: authData.refresh_token,
		};
	}

	@ApiOperation({ summary: 'Login ou cadastro com Google' })
	@Post('google')
	@Public()
	@Throttle({ default: { limit: 10, ttl: 900000 } })
	async googleAuth(@Body() dto: GoogleAuthDto) {
		return this.googleOAuthService.loginWithGoogle(dto);
	}

	@ApiOperation({ summary: 'Completar cadastro Google (onboarding)' })
	@Post('google/complete')
	@Public()
	@Throttle({ default: { limit: 5, ttl: 900000 } })
	async googleComplete(@Body() dto: GoogleAuthCompleteDto) {
		return this.googleOAuthService.completeGoogleRegistration(dto);
	}

	@ApiOperation({ summary: 'Registrar nova conta' })
	@ApiResponse({
		status: 201,
		description: 'Conta criada com sucesso',
		type: AuthResponseDto,
	})
	@Post('register')
	@Public()
	@Throttle({ default: { limit: 5, ttl: 900000 } })
	async register(@Body() registerDto: RegisterDto) {
		const authData = await this.authService.register(registerDto);

		// response.cookie('refresh_token', authData?.refresh_token, {
		//   httpOnly: true,
		//   sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
		//   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
		//   secure: process.env.NODE_ENV === 'production' ? true : false,
		// });

		return {
			account: authData?.account,
			access_token: authData?.access_token,
			refresh_token: authData?.refresh_token,
		};
	}

	// TODO: escrever teste e2e de verifyEmail -> auth.controller
	// TODO: escrever teste unitário de verifyEmail -> auth.controller
	@ApiOperation({ summary: 'Verificar email' })
	@ApiQuery({ name: 'token', type: String })
	@ApiResponse({ status: 200, type: SuccessResponseDTO })
	@ApiResponse({ status: 400, description: 'Token inválido ou expirado' })
	@Public()
	@Get('verify-email')
	async verifyEmail(@Query('token') token: string) {
		return await this.authService.verifyEmail(token);
	}

	@ApiOperation({
		summary: 'Atualizar Access Token',
		description: 'Envia o x-refresh-token via Header para obter novos tokens',
	})
	@ApiResponse({ status: 200, type: AuthResponseDto })
	@ApiHeader({
		name: 'x-refresh-token',
		required: true,
		description: 'Token de atualização enviado no header',
	})
	@Post('refresh')
	@Public()
	@Throttle({ default: { limit: 5, ttl: 900000 } })
	async refresh(@Headers('x-refresh-token') token: string) {
		const { account, access_token, refresh_token } =
			await this.authService.refreshTokens(token);

		// response.cookie('refresh_token', refresh_token, {
		//   httpOnly: true,
		//   sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
		//   secure: process.env.NODE_ENV === 'production' ? true : false,
		// });

		return { account, access_token, refresh_token };
	}

	@ApiOperation({ summary: 'Encerrar sessão' })
	@ApiResponse({ status: 200, type: SecureAccountDTO })
	@Post('logout')
	@Throttle({ default: { limit: 5, ttl: 900000 } })
	logout() {
		// response.cookie('refresh_token', '', {
		//   httpOnly: true,
		//   expires: new Date(0),
		//   sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
		//   secure: process.env.NODE_ENV === 'production' ? true : false,
		// });

		return { message: 'Logout realizado com sucesso' };
	}

	@ApiOperation({ summary: 'Checar se campo (email/telefone) já existe' })
	@ApiResponse({
		status: 200,
		description: 'Retorna se o valor está disponível para uso',
	})
	@Public()
	@Get('check-unique')
	@Throttle({ default: { limit: 5, ttl: 900000 } })
	async checkUnique(@Query() dto: CheckUniqueDto) {
		return this.authService.isUniqueAvailable(dto.field, dto.value);
	}

	@ApiOperation({ summary: 'Obter dados do usuário logado' })
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Checar validade de criação um campo único por seu valor',
	})
	@Get('me')
	@Throttle({ default: { limit: 15, ttl: 900000 } })
	async getMe(@Headers('Authorization') authorization: string) {
		return this.authService.getMe(authorization);
	}
}
