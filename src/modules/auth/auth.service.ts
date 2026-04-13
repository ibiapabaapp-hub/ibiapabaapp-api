import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from 'src/modules/common/jwt/jwt.service';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';
import { SecureUserDto } from 'src/modules/users/dtos/secure-user-dto';
import { User } from 'src/modules/users/entities/user.entity';
import { UsersService } from 'src/modules/users/users.service';
import { extractBearerTokenFromString } from 'src/utils/extract-bearer-token';

import { PasswordService } from '../common/password/password.service';
import {
	AuthResponseDto,
	CheckUniqueResponseDto,
} from './dtos/auth-response.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { UniqueUserField } from './dtos/unique-user-fields';

@Injectable()
export class AuthService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly passwordService: PasswordService,
		private readonly jwtService: JwtService,
		private readonly userService: UsersService,
	) {}

	private generateAuthResponse(user: User | SecureUserDto): AuthResponseDto {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...userWithoutPassword } = user as User;
		const payload = { id: user.id, role: user.role };

		return {
			user: userWithoutPassword as SecureUserDto,
			accessToken: this.jwtService.sign(payload, { expiresIn: '40m' }),
			refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
		};
	}

	async login(loginDto: LoginDto): Promise<{
		accessToken: string;
		refreshToken: string;
		user: SecureUserDto;
	}> {
		const { email, password } = loginDto;

		const user = await this.userService.findOneByEmail(email, true);
		const isPasswordValid = await this.passwordService.verifyPassword(
			user.password,
			password,
		);
		if (!isPasswordValid) {
			throw new UnauthorizedException({
				message: 'Invalid credentials',
				code: 'wrong_password',
			});
		}

		return this.generateAuthResponse(user);
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

		const user = await this.userService.create(registerDto);
		return this.generateAuthResponse(user);
	}

	async refreshTokens(refreshToken: string): Promise<{
		user: SecureUserDto;
		refreshToken: string;
		accessToken: string;
	}> {
		const decodedTokenData = this.jwtService.verify<{
			id: string;
			role: number;
		}>(refreshToken);

		const user = await this.userService.findOneById(decodedTokenData.id);
		if (!user) {
			throw new UnauthorizedException({
				message: 'Expired or invalid token',
				code: 'invalid_token',
			});
		}

		return this.generateAuthResponse(user);
	}

	async isUniqueAvailable<K extends UniqueUserField>(
		field: K,
		value: User[K],
	): Promise<CheckUniqueResponseDto> {
		try {
			const count = await this.prismaService.user.count({
				where: {
					[field]: value,
				},
			});

			return {
				field,
				value,
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
		return this.userService.findOneById(id);
	}
}
