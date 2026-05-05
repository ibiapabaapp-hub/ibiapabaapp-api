import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { CreateEventDTO } from './dto/create-event.dto';
import { UpdateEventDTO } from './dto/update-event.dto';

@Injectable()
export class EventsService {
	constructor(private readonly prismaService: PrismaService) {}

	async create(dto: CreateEventDTO) {
		return await this.prismaService.event.create({
			data: {
				owner_account_id: dto.owner_account_id,
				name: dto.name,
				description: dto.description,
				cover_img_url: dto.cover_img_url,
				slug: dto.slug,
				type: dto.type,
				active: dto.active,
				reach_level: dto.reach_level,
				start_date: dto.start_date,
				end_date: dto.end_date,
			} as any,
		});
	}

	async findAll() {
		const events = await this.prismaService.event.findMany({
			include: {
				categories: {
					select: { category: { select: { name: true } } },
				},
				owner: {
					select: {
						id: true,
						slug: true,
						display_name: true,
						avatar_url: true,
						type: true,
					},
				},
			},
			orderBy: { name: 'asc' },
		});

		return events.map((e) => ({
			...e,
			categories: e.categories.map((cat) => cat.category.name),
		}));
	}

	async findOne(id: string) {
		const event = await this.prismaService.event.findUnique({
			where: { id },
			include: {
				categories: {
					select: { category: { select: { name: true } } },
				},
				owner: {
					select: {
						id: true,
						slug: true,
						display_name: true,
						avatar_url: true,
						type: true,
					},
				},
			},
		});

		if (!event) {
			throw new NotFoundException();
		}

		return {
			...event,
			categories: event.categories.map((cat) => cat.category.name),
		};
	}

	async update(id: string, dto: UpdateEventDTO) {
		await this.findOne(id);
		return await this.prismaService.event.update({
			where: { id },
			data: {
				name: dto.name,
				description: dto.description,
				cover_img_url: dto.cover_img_url,
				slug: dto.slug,
				type: dto.type,
				active: dto.active,
				reach_level: dto.reach_level,
				start_date: dto.start_date,
				end_date: dto.end_date,
			},
		});
	}

	async remove(id: string) {
		await this.findOne(id);
		return await this.prismaService.event.delete({ where: { id } });
	}
}
