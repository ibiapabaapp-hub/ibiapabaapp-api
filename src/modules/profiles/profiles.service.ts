import { randomUUID } from 'crypto';

import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { CreateProfileDTO } from './dto/create-profile.dto';
import { UpdateProfileDTO } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
	constructor(private readonly prismaService: PrismaService) {}

	async create(accountId: string, data: CreateProfileDTO) {
		const existingProfile = await this.prismaService.profile.findUnique({
			where: { slug: data.slug },
		});

		if (existingProfile) {
			throw new BadRequestException({
				message: 'Profile slug already exists',
				code: 'slug_exists',
			});
		}

		const profileId = randomUUID();

		const [profile] = await this.prismaService.$transaction([
			this.prismaService.profile.create({
				data: {
					id: profileId,
					slug: data.slug,
					display_name: data.display_name,
					bio: data.bio,
					avatar_url: data.avatar_url,
					type: data.type,
				},
			}),
			this.prismaService.account_profile.create({
				data: {
					id: randomUUID(),
					account_id: accountId,
					profile_id: profileId,
					role: 'owner',
				},
			}),
		]);

		return profile;
	}

	async findAllByAccountId(accountId: string) {
		const accountProfiles = await this.prismaService.account_profile.findMany({
			where: { account_id: accountId },
		});

		if (!accountProfiles) {
			throw new NotFoundException('Profiles not found');
		}

		const profileIds = accountProfiles.map(
			(accountProfile) => accountProfile.profile_id,
		);

		const profiles = await this.prismaService.profile.findMany({
			where: { id: { in: profileIds } },
			include: {
				business: {
					select: {
						id: true,
						cnpj: true,
						max_reach_level: true,
						categories: {
							select: {
								id: true,
							},
						},
					},
				},
			},
		});

		return profiles.map((p) => {
			if (p.type === 'business') {
				return {
					...p,
					role: accountProfiles.find((ap) => ap.profile_id === p.id)?.role,
					business: {
						...p.business,
						categories: p.business?.categories.map((c) => c.id),
					},
				};
			}

			return p;
		});
	}

	async findOneById(profileId: string, accountId: string) {
		const accountProfile = await this.prismaService.account_profile.findFirst({
			where: {
				profile_id: profileId,
				account_id: accountId,
			},
		});

		if (!accountProfile) {
			throw new NotFoundException('Profile not found');
		}

		const profile = await this.prismaService.profile.findUnique({
			where: { id: profileId },
		});

		return profile;
	}

	async update(profileId: string, accountId: string, data: UpdateProfileDTO) {
		const accountProfile = await this.prismaService.account_profile.findFirst({
			where: {
				profile_id: profileId,
				account_id: accountId,
			},
		});

		if (!accountProfile) {
			throw new NotFoundException('Profile not found');
		}

		const profile = await this.prismaService.profile.update({
			where: { id: profileId },
			data: {
				...(data.slug && { slug: data.slug }),
				...(data.display_name && { display_name: data.display_name }),
				...(data.bio !== undefined && { bio: data.bio }),
				...(data.avatar_url !== undefined && { avatar_url: data.avatar_url }),
			},
		});

		return profile;
	}

	async remove(profileId: string, accountId: string) {
		const accountProfile = await this.prismaService.account_profile.findFirst({
			where: {
				profile_id: profileId,
				account_id: accountId,
			},
		});

		if (!accountProfile) {
			throw new NotFoundException('Profile not found');
		}

		const profile = await this.prismaService.profile.findUnique({
			where: { id: profileId },
		});

		await this.prismaService.profile.delete({
			where: { id: profileId },
		});

		return profile;
	}

	async isProfileOwner(profileId: string, accountId: string): Promise<boolean> {
		const accountProfile = await this.prismaService.account_profile.findFirst({
			where: {
				profile_id: profileId,
				account_id: accountId,
			},
		});

		return !!accountProfile;
	}
}
