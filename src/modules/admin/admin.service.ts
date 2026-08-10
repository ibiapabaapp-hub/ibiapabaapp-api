import { Injectable } from '@nestjs/common';

import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AdminService {
	constructor(private readonly prisma: PrismaService) {}

	async overview() {
		const [accounts, businesses, events, cities, leads, reviews] =
			await Promise.all([
				this.prisma.account.count(),
				this.prisma.business.count(),
				this.prisma.event.count(),
				this.prisma.city.count(),
				this.prisma.lead.count(),
				this.prisma.review.count(),
			]);
		return {
			accounts,
			businesses,
			events,
			cities,
			leads,
			reviews,
			generated_at: new Date(),
		};
	}
}
