import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { SearchResponseDto } from './entities/search-result.entity';

@Injectable()
export class SearchService {
	constructor(private readonly prisma: PrismaService) {}

	async search(query: string): Promise<SearchResponseDto> {
		const [cities, companies, events] = await Promise.all([
			this.prisma.city.findMany({
				where: {
					name: {
						contains: query,
						mode: 'insensitive',
					},
				},
				take: 10,
			}),
			this.prisma.company.findMany({
				where: {
					name: {
						contains: query,
						mode: 'insensitive',
					},
					active: true,
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
			companies,
			events,
		};
	}
}
