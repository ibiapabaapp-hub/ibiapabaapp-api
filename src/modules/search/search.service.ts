import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { SearchResponseDto } from './entities/search-result.entity';

@Injectable()
export class SearchService {
	constructor(private readonly prisma: PrismaService) {}

	async search(query: string): Promise<SearchResponseDto> {
		const [cities, businesses, events] = await Promise.all([
			this.prisma.city.findMany({
				where: {
					name: {
						contains: query,
						mode: 'insensitive',
					},
				},
				take: 10,
			}),
			this.prisma.business.findMany({
				where: {
					account: {
						display_name: {
							contains: query,
							mode: 'insensitive',
						},
					},
				},
				select: {
					id: true,
					cnpj: true,
					account_id: true,
					max_reach_level: true,
					created_at: true,
					updated_at: true,
				},
				take: 10,
			}),
			this.prisma.event.findMany({
				where: {
					name: {
						contains: query,
						mode: 'insensitive',
					},
					active: true,
				},
				take: 10,
			}),
		]);

		return {
			cities,
			businesses,
			events,
		};
	}
}
