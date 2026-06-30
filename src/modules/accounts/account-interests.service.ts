import { randomUUID } from 'crypto';

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { UpdateInterestsDTO } from './dtos/update-interests.dto';

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
				tag: {
					include: { group: true },
				},
			},
		});

		const businesses: { id: string; name: string }[] = [];
		const events: { id: string; name: string }[] = [];

		for (const interest of interests) {
			const tag = interest.tag;
			const group = tag.group.name.toLowerCase();

			if (group === 'business') {
				businesses.push({ id: tag.id, name: tag.name });
			}
			if (group === 'event') {
				events.push({ id: tag.id, name: tag.name });
			}
		}

		return { businesses, events };
	}

	async upsert(accountId: string, dto: UpdateInterestsDTO) {
		const account = await this.prismaService.account.findUnique({
			where: { id: accountId },
		});

		if (!account) {
			throw new NotFoundException('Account not found');
		}

		const businessesData = (dto.businesses || []).map((bInterest) => ({
			id: randomUUID(),
			account_id: accountId,
			tag_id: bInterest,
		}));

		const eventsData = (dto.events || []).map((eInterest) => ({
			id: randomUUID(),
			account_id: accountId,
			tag_id: eInterest,
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
				select: { tag_id: true },
			},
		);

		return { count: updatedInterests.length };
	}
}
