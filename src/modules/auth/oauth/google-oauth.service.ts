import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { JwtService } from 'src/modules/common/jwt/jwt.service';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { GoogleAuthCompleteDto } from '../dtos/google-auth/google-auth-complete.dto';
import { GoogleAuthDto } from '../dtos/google-auth/google-auth.dto';

@Injectable()
export class GoogleOAuthService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly jwtService: JwtService,
	) {}

	private readonly TEMP_TOKEN_SECRET = process.env.TEMP_TOKEN_SECRET!;
	private readonly GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
	private readonly GOOGLE_CLIENT_ID_IOS = process.env.GOOGLE_CLIENT_ID_IOS!;
	private readonly GOOGLE_CLIENT_ID_WEB = process.env.GOOGLE_CLIENT_ID_WEB!;
	private readonly TEMP_TOKEN_EXPIRES_IN = process.env.TEMP_TOKEN_EXPIRES_IN!;

	async loginWithGoogle(dto: GoogleAuthDto) {
		// 1. Verificar o id_token com o Google
		const client = new OAuth2Client(this.GOOGLE_CLIENT_ID);
		const ticket = await client.verifyIdToken({
			idToken: dto.id_token,
			audience: [
				this.GOOGLE_CLIENT_ID,
				this.GOOGLE_CLIENT_ID_IOS,
				this.GOOGLE_CLIENT_ID_WEB,
			],
		});
		const payload = ticket.getPayload();

		if (payload == null || payload.email == null) {
			throw new UnauthorizedException({
				message: 'Invalid token',
				code: 'invalid_token',
			});
		}
		// payload contém: sub (uid), email, name, picture, email_verified

		// 2. Verificar se já existe um vínculo OAuth
		const existingOAuth = await this.prismaService.account_oauth.findUnique({
			where: {
				provider_provider_uid: {
					provider: 'google',
					provider_uid: payload.sub,
				},
			},
			include: { account: true },
		});

		if (existingOAuth) {
			// Usuário já tem conta → login direto
			const account = existingOAuth.account;
			return {
				is_new_user: false,
				account,
				access_token: this.jwtService.sign(
					{ id: account.id },
					{ expiresIn: '40m' },
				),
				refresh_token: this.jwtService.sign(
					{ id: account.id },
					{ expiresIn: '7d' },
				),
			};
		}

		// 3. Verificar se já existe conta com esse email (conta criada com senha)
		const existingAccount = await this.prismaService.account.findUnique({
			where: { email: payload.email },
		});

		if (existingAccount) {
			// Vincular o Google à conta existente automaticamente
			await this.prismaService.account_oauth.create({
				data: {
					account_id: existingAccount.id,
					provider: 'google',
					provider_uid: payload.sub,
					email: payload.email,
				},
			});
			return {
				is_new_user: false,
				account: existingAccount,
				access_token: this.jwtService.sign(
					{ id: existingAccount.id },
					{ expiresIn: '40m' },
				),
				refresh_token: this.jwtService.sign(
					{ id: existingAccount.id },
					{ expiresIn: '7d' },
				),
			};
		}

		// 4. Usuário novo → emitir temp_token para onboarding
		const temp_token = this.jwtService.sign(
			{
				google_sub: payload.sub,
				email: payload.email,
				name: payload.name,
				avatar_url: payload.picture,
			},
			{ expiresIn: (this.TEMP_TOKEN_EXPIRES_IN as any) || '15m' },
			this.TEMP_TOKEN_SECRET,
		);

		return {
			is_new_user: true,
			temp_token,
			email: payload.email,
			name: payload.name,
			avatar_url: payload.picture,
		};
	}

	async completeGoogleRegistration(dto: GoogleAuthCompleteDto) {
		// 1. Verificar e decodificar o tempToken
		let tempData: {
			google_sub: string;
			email: string;
			name: string;
			avatar_url?: string;
		};

		try {
			tempData = this.jwtService.verify(dto.temp_token, this.TEMP_TOKEN_SECRET);
		} catch {
			throw new UnauthorizedException({
				message: 'Invalid or expired temp token',
				code: 'invalid_temp_token',
			});
		}

		// 2. Verificar se o slug já está em uso
		const slugTaken = await this.prismaService.account.count({
			where: { slug: dto.slug },
		});
		if (slugTaken > 0) {
			throw new BadRequestException({
				message: 'Slug already taken',
				code: 'slug_taken',
			});
		}

		// 3. Criar a conta + vínculo OAuth em uma transaction
		const account = await this.prismaService.$transaction(async (tx) => {
			const newAccount = await tx.account.create({
				data: {
					email: tempData.email,
					slug: dto.slug,
					display_name: tempData.name,
					name: tempData.name,
					avatar_url: tempData.avatar_url,
					type: dto.type,
					gender: dto.gender,
					is_verified: true, // email já verificado pelo Google
					password: null,
					phone_number: null,
				},
			});

			await tx.account_oauth.create({
				data: {
					account_id: newAccount.id,
					provider: 'google',
					provider_uid: tempData.google_sub,
					email: tempData.email,
				},
			});

			return newAccount;
		});

		return {
			account,
			access_token: this.jwtService.sign(
				{ id: account.id },
				{ expiresIn: '40m' },
			),
			refresh_token: this.jwtService.sign(
				{ id: account.id },
				{ expiresIn: '7d' },
			),
		};
	}
}
