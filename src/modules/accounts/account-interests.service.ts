import { randomUUID } from 'crypto';

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { UpdateInterestsDTO } from './dtos/update-interests.dto';

interface InterestCategory {
	id: string;
	name: string;
	entities: string[];
}

export interface AccountInterestsResult {
	businesses: { id: string; name: string }[];
	events: { id: string; name: string }[];
}

@Injectable()
export class AccountInterestsService {
	constructor(private readonly prismaService: PrismaService) {}

	async findAllByAccountId(accountId: string): Promise<AccountInterestsResult> {
		const interests = await this.prismaService.account_interest.findMany({
			where: { account_id: accountId },
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

	async upsert(accountId: string, dto: UpdateInterestsDTO) {
		// Verify account exists
		const account = await this.prismaService.account.findUnique({
			where: { id: accountId },
		});

		if (!account) {
			throw new NotFoundException('Account not found');
		}

		const businessesData = (dto.businesses || []).map((bInterest) => ({
			id: randomUUID(),
			account_id: accountId,
			category_id: bInterest,
		}));

		const eventsData = (dto.events || []).map((eInterest) => ({
			id: randomUUID(),
			account_id: accountId,
			category_id: eInterest,
		}));

		await this.prismaService.$transaction([
			this.prismaService.account_interest.deleteMany({
				where: { account_id: accountId },
			}),
			...(businessesData.length > 0
				? [
						this.prismaService.account_interest.createMany({
							data: businessesData,
							skipDuplicates: true,
						}),
					]
				: []),
			...(eventsData.length > 0
				? [
						this.prismaService.account_interest.createMany({
							data: eventsData,
							skipDuplicates: true,
						}),
					]
				: []),
		]);

		const updatedInterests = await this.prismaService.account_interest.findMany(
			{
				where: { account_id: accountId },
				select: { category_id: true },
			},
		);

		return { count: updatedInterests.length };
	}
}
