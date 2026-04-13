import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { UserInterestsResponse } from './entities/user_interest.entity';

@Injectable()
export class UserInterestsService {
	constructor(private prisma: PrismaService) {}

	async addInterests(
		userId: string,
		categoryIds: string[],
	): Promise<{ count: number }> {
		return await this.prisma.user_interest.createMany({
			data: categoryIds.map((category_id) => ({
				user_id: userId,
				category_id,
			})),
			skipDuplicates: true, // ignora interesse se ja existir
		});
	}

	async updateInterests(
		userId: string,
		companiesIds: string[] = [],
		eventsIds: string[] = [],
	): Promise<{ count: number }> {
		const categoryIds = [...new Set([...companiesIds, ...eventsIds])];

		return await this.prisma.$transaction(async (tx) => {
			await tx.user_interest.deleteMany({
				where: { user_id: userId },
			});

			return await tx.user_interest.createMany({
				data: categoryIds.map((category_id) => ({
					user_id: userId,
					category_id,
				})),
				skipDuplicates: true,
			});
		});
	}

	async listInterests(userId: string): Promise<UserInterestsResponse> {
		const userInterests = await this.prisma.user_interest.findMany({
			where: { user_id: userId },
			include: { category: true },
		});

		return {
			companies_ids: userInterests
				.filter((i) => i.category.entities.includes('company'))
				.map((i) => i.category_id),
			events_ids: userInterests
				.filter((i) => i.category.entities.includes('event'))
				.map((i) => i.category_id),
		};
	}
}
