import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from 'src/modules/common/jwt/jwt.service';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';
import { extractBearerTokenFromString } from 'src/utils/extract-bearer-token';

@Injectable()
export class ProfileOwnershipGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly prismaService: PrismaService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const authorization = request.headers.authorization;

		if (!authorization) {
			throw new UnauthorizedException({
				message: 'Authorization required',
				code: 'no_authorization',
			});
		}

		const token = extractBearerTokenFromString(authorization);
		const { id: tokenAccountId } = this.jwtService.verify<{ id: string }>(
			token,
		);

		const pathAccountId = request.params.accountId;

		if (tokenAccountId !== pathAccountId) {
			throw new UnauthorizedException({
				message: 'Account ID from token does not match account ID from path',
				code: 'account_id_mismatch',
			});
		}

		const profileId = request.params.profileId || request.params.id;

		const accountProfile = await this.prismaService.account_profile.findFirst({
			where: {
				profile_id: profileId,
				account_id: pathAccountId,
			},
		});

		if (!accountProfile) {
			throw new UnauthorizedException({
				message: 'Not authorized to access this profile',
				code: 'not_owner',
			});
		}

		request.accountId = pathAccountId;
		return true;
	}
}
