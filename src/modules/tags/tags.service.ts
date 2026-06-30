import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
	constructor(private readonly prismaService: PrismaService) {}

	private slugify(name: string): string {
		return name
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
	}

	create(dto: CreateTagDto) {
		return this.prismaService.tag.create({
			data: {
				name: dto.name,
				slug: this.slugify(dto.name),
				group_id: dto.group_id,
				description: dto.description,
				color: dto.color,
				position: dto.position ?? 0,
			},
		});
	}

	findAll(filters?: { group_id?: string; name?: string }) {
		return this.prismaService.tag.findMany({
			where: {
				...(filters?.group_id && { group_id: filters.group_id }),
				...(filters?.name && {
					name: { contains: filters.name, mode: 'insensitive' },
				}),
			},
			include: { group: true },
			orderBy: [{ group: { name: 'asc' } }, { position: 'asc' }],
		});
	}

	search(query: string) {
		return this.prismaService.tag.findMany({
			where: {
				name: { contains: query, mode: 'insensitive' },
			},
			include: { group: true },
			orderBy: { name: 'asc' },
		});
	}

	async findOne(id: string) {
		const tag = await this.prismaService.tag.findUnique({
			where: { id },
			include: { group: true },
		});
		if (!tag) throw new NotFoundException();
		return tag;
	}

	async findBySlug(slug: string) {
		const tag = await this.prismaService.tag.findUnique({
			where: { slug },
			include: { group: true },
		});
		if (!tag) throw new NotFoundException();
		return tag;
	}

	async update(id: string, dto: UpdateTagDto) {
		await this.findOne(id);
		return this.prismaService.tag.update({
			where: { id },
			data: {
				...dto,
				...(dto.name && { slug: this.slugify(dto.name) }),
			},
		});
	}

	async remove(id: string) {
		await this.findOne(id);
		return this.prismaService.tag.delete({ where: { id } });
	}
}
