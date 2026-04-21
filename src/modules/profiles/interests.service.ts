import { randomUUID } from 'crypto';

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { UpdateInterestsDTO } from './dto/update-interests.dto';

interface InterestCategory {
	id: string;
	name: string;
	entities: string[];
}

export interface ProfileInterestsResult {
	businesses: { id: string; name: string }[];
	events: { id: string; name: string }[];
}

@Injectable()
export class ProfileInterestsService {
	constructor(private readonly prismaService: PrismaService) {}

	async findAllByProfileId(profileId: string): Promise<ProfileInterestsResult> {
		const interests = await this.prismaService.profile_interest.findMany({
			where: { profile_id: profileId },
			include: {
				category: {
					select: {
						id: true,
						name: true,
						entities: true,
					},
				},
			},
		});

		const businesses: { id: string; name: string }[] = [];
		const events: { id: string; name: string }[] = [];

		for (const interest of interests) {
			const categories = interest.category as unknown as InterestCategory;
			if (categories.entities.includes('business')) {
				businesses.push({ id: categories.id, name: categories.name });
			}
			if (categories.entities.includes('event')) {
				events.push({ id: categories.id, name: categories.name });
			}
		}

		return { businesses, events };
	}

	async upsert(accountId: string, profileId: string, dto: UpdateInterestsDTO) {
		const accountProfile = await this.prismaService.account_profile.findFirst({
			where: { account_id: accountId, profile_id: profileId },
		});

		if (!accountProfile) {
			throw new NotFoundException('Profile not found');
		}

		const businessesData = (dto.businesses || []).map((bInterest) => ({
			id: randomUUID(),
			profile_id: profileId,
			category_id: bInterest,
		}));

		const eventsData = (dto.events || []).map((eInterest) => ({
			id: randomUUID(),
			profile_id: profileId,
			category_id: eInterest,
		}));

		await this.prismaService.$transaction([
			this.prismaService.profile_interest.deleteMany({
				where: { profile_id: profileId },
			}),
			...(businessesData.length > 0
				? [
						this.prismaService.profile_interest.createMany({
							data: businessesData,
							skipDuplicates: true,
						}),
					]
				: []),
			...(eventsData.length > 0
				? [
						this.prismaService.profile_interest.createMany({
							data: eventsData,
							skipDuplicates: true,
						}),
					]
				: []),
		]);

		const updatedInterests = await this.prismaService.profile_interest.findMany(
			{
				where: { profile_id: profileId },
				select: { category_id: true },
			},
		);

		return { count: updatedInterests.length };
	}
}
