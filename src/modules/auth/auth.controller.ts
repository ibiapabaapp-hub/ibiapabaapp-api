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
import { AuthResponseDto } from './dtos/auth-response.dto';
import { CheckUniqueDto } from './dtos/check-unique-field.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { SuccessResponseDTO } from './dtos/success-response.dto';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
	constructor(private readonly authService: AuthService) {}

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
		// response.cookie('refreshToken', authData.refreshToken, {
		//   httpOnly: true,
		//   sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
		//   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
		//   secure: process.env.NODE_ENV === 'production' ? true : false,
		// });

		return {
			account: authData.account,
			accessToken: authData.accessToken,
			refreshToken: authData.refreshToken,
		};
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

		// response.cookie('refreshToken', authData?.refreshToken, {
		//   httpOnly: true,
		//   sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
		//   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
		//   secure: process.env.NODE_ENV === 'production' ? true : false,
		// });

		return {
			account: authData?.account,
			accessToken: authData?.accessToken,
			refreshToken: authData?.refreshToken,
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
		const { account, accessToken, refreshToken } =
			await this.authService.refreshTokens(token);

		// response.cookie('refreshToken', refreshToken, {
		//   httpOnly: true,
		//   sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
		//   secure: process.env.NODE_ENV === 'production' ? true : false,
		// });

		return { account, accessToken, refreshToken };
	}

	@ApiOperation({ summary: 'Encerrar sessão' })
	@ApiResponse({ status: 200, type: SecureAccountDTO })
	@Post('logout')
	@Throttle({ default: { limit: 5, ttl: 900000 } })
	logout() {
		// response.cookie('refreshToken', '', {
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
