import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	UnauthorizedException,
} from '@nestjs/common';
import { account } from '@prisma/client';
import { AccountsService } from 'src/modules/accounts/accounts.service';
import { JwtService } from 'src/modules/common/jwt/jwt.service';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';
import { extractBearerTokenFromString } from 'src/utils/extract-bearer-token';

import { verifyPassword } from '../common/password/password.util';
import { TokenService } from '../common/token/token.service';
import { EmailService } from '../email/email.service';
import {
	AuthResponseDto,
	CheckUniqueResponseDto,
} from './dtos/manual-auth/auth-response.dto';
import { LoginDto } from './dtos/manual-auth/login.dto';
import { RegisterDto } from './dtos/manual-auth/register.dto';
import { UniqueAccountFields } from './dtos/unique-account-fields';

@Injectable()
export class AuthService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly jwtService: JwtService,
		private readonly accountService: AccountsService,
		private readonly tokenService: TokenService,
		private readonly emailService: EmailService,
	) {}

	async login(loginDto: LoginDto): Promise<AuthResponseDto> {
		const { email, password } = loginDto;

		const account = await this.accountService.findOneByEmail(email, true);
		const isPasswordValid = await verifyPassword(account.password!, password);
		if (!isPasswordValid) {
			throw new UnauthorizedException({
				message: 'Invalid credentials',
				code: 'wrong_password',
			});
		}

		const access_token = this.jwtService.sign(
			{ id: account.id },
			{ expiresIn: '40m' },
		);
		const refresh_token = this.jwtService.sign(
			{ id: account.id },
			{ expiresIn: '7d' },
		);

		return new AuthResponseDto({ account, access_token, refresh_token });
	}

	async register(
		registerDto: RegisterDto,
	): Promise<AuthResponseDto | undefined> {
		const { password, password_confirm } = registerDto;

		if (password !== password_confirm) {
			throw new BadRequestException({
				message: 'Password and password confirmation must be equal',
				code: 'password_mismatch',
			});
		}

		const account = await this.accountService.create(registerDto);
		const access_token = this.jwtService.sign(
			{ id: account.id },
			{ expiresIn: '40m' },
		);
		const refresh_token = this.jwtService.sign(
			{ id: account.id },
			{ expiresIn: '7d' },
		);

		const token = await this.tokenService.create(account.id, 'verify_email');
		await this.emailService.sendVerificationEmail(account.email, token);
		return new AuthResponseDto({ account, access_token, refresh_token });
	}

	// TODO: escrever teste unitário de verifyEmail -> auth.service
	async verifyEmail(token: string): Promise<{ success: boolean }> {
		const rawAccountId = await this.tokenService.validateAndConsume(
			token,
			'verify_email',
		);

		if (!rawAccountId) {
			throw new BadRequestException({
				message: 'Invalid token',
				code: 'invalid_token',
			});
		}

		const verifyResult = await this.accountService.verifyAccount(rawAccountId);
		return { success: verifyResult.is_verified };
	}

	async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
		const decodedTokenData = this.jwtService.verify<{
			id: string;
			role: number;
		}>(refreshToken);

		const account = await this.accountService.findOneById(decodedTokenData.id);
		if (!account) {
			throw new UnauthorizedException({
				message: 'Expired or invalid token',
				code: 'invalid_token',
			});
		}

		const access_token = this.jwtService.sign(
			{ id: account.id },
			{ expiresIn: '40m' },
		);
		const refresh_token = this.jwtService.sign(
			{ id: account.id },
			{ expiresIn: '7d' },
		);

		return new AuthResponseDto({ account, access_token, refresh_token });
	}

	async isUniqueAvailable<K extends UniqueAccountFields>(
		field: K,
		value: account[K],
	): Promise<CheckUniqueResponseDto> {
		try {
			const count = await this.prismaService.account.count({
				where: {
					[field]: value,
				},
			});

			return {
				field,
				value: value as string,
				available: count === 0,
			};
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerErrorException(e.message);
			}
			throw new InternalServerErrorException('Unexpected error');
		}
	}

	async getMe(authorization: string) {
		const token = extractBearerTokenFromString(authorization);
		const { id } = this.jwtService.verify<{ id: string; role: string }>(token);
		return this.accountService.findOneInDetailById(id);
	}
}
