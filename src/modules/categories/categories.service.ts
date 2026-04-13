import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { CategoryEntity } from './dto/category-entity.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
	constructor(private readonly prisma: PrismaService) {}
	create(createCategoryDto: CreateCategoryDto) {
		return this.prisma.category.create({
			data: createCategoryDto,
		});
	}

	async findParents(entity?: CategoryEntity) {
		return this.prisma.category.findMany({
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

	async findChildren(parentId: string, entity?: CategoryEntity) {
		return this.prisma.category.findMany({
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
		const category = await this.prisma.category.findFirst({
			where: { id },
		});

		if (!category) {
			throw new NotFoundException();
		}

		return category;
	}

	async update(id: string, updateCategoryDto: UpdateCategoryDto) {
		await this.findOne(id);
		return await this.prisma.category.update({
			where: { id },
			data: updateCategoryDto,
		});
	}

	async remove(id: string) {
		await this.findOne(id);
		return await this.prisma.category.delete({
			where: { id },
		});
	}
}
