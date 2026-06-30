import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';
import { CreateTagGroupDto } from './dto/create-tag-group.dto';
import { UpdateTagGroupDto } from './dto/update-tag-group.dto';

@Injectable()
export class TagGroupsService {
	constructor(private readonly prismaService: PrismaService) {}

	create(dto: CreateTagGroupDto) {
		return this.prismaService.tag_group.create({ data: dto });
	}

	findAll() {
		return this.prismaService.tag_group.findMany({
			include: { tags: { orderBy: { position: 'asc' } } },
			orderBy: { name: 'asc' },
		});
	}

	async findOne(id: string) {
		const group = await this.prismaService.tag_group.findUnique({
			where: { id },
			include: { tags: { orderBy: { position: 'asc' } } },
		});
		if (!group) throw new NotFoundException();
		return group;
	}

	async update(id: string, dto: UpdateTagGroupDto) {
		await this.findOne(id);
		return this.prismaService.tag_group.update({ where: { id }, data: dto });
	}

	async remove(id: string) {
		await this.findOne(id);
		return this.prismaService.tag_group.delete({ where: { id } });
	}
}
