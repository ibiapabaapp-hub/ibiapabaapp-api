import { Injectable, NotFoundException } from '@nestjs/common';
import { entity_category } from '@prisma/client';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
	constructor(private readonly prismaService: PrismaService) {}
	create(createCategoryDto: CreateCategoryDto) {
		return this.prismaService.category.create({
			data: createCategoryDto,
		});
	}

	findAll() {
		return this.prismaService.category.findMany({
			orderBy: { name: 'asc' },
		});
	}

	async findParents(entity?: entity_category) {
		return this.prismaService.category.findMany({
			where: {
				parent_id: null,
				...(entity && {
					OR: [
						{ entities: { has: entity } },
						{ children: { some: { entities: { has: entity } } } },
					],
				}),
			},
			select: {
				id: true,
				name: true,
				entities: true,
				children: {
					where: entity ? { entities: { has: entity } } : undefined,
					select: {
						id: true,
						name: true,
						entities: true,
					},
				},
			},
			orderBy: { name: 'asc' },
		});
	}

	async findChildren(parentId: string, entity?: entity_category) {
		return this.prismaService.category.findMany({
			where: {
				parent_id: parentId,
				...(entity && { entities: { has: entity } }),
			},
			select: {
				id: true,
				name: true,
				entities: true,
			},
			orderBy: { name: 'asc' },
		});
	}

	async findOne(id: string) {
		const category = await this.prismaService.category.findFirst({
			where: { id },
		});

		if (!category) {
			throw new NotFoundException();
		}

		return category;
	}

	async update(id: string, updateCategoryDto: UpdateCategoryDto) {
		await this.findOne(id);
		return await this.prismaService.category.update({
			where: { id },
			data: updateCategoryDto,
		});
	}

	async remove(id: string) {
		await this.findOne(id);
		return await this.prismaService.category.delete({
			where: { id },
		});
	}
}
