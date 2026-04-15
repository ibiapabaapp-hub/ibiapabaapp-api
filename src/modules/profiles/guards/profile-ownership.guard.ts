import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

@Injectable()
export class ProfileOwnershipGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const user = request.user as { id: string } | undefined;

		if (!user?.id) {
			throw new UnauthorizedException({
				message: 'Authorization required',
				code: 'no_authorization',
			});
		}

		const profileId = request.params.id;
		const accountId = user.id;

		const accountProfile = await this.prismaService.account_profile.findFirst({
			where: {
				profile_id: profileId,
				account_id: accountId,
			},
		});

		if (!accountProfile) {
			throw new UnauthorizedException({
				message: 'Not authorized to access this profile',
				code: 'not_owner',
			});
		}

		request.accountId = accountId;
		return true;
	}
}
