import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { CreateBusinessDTO } from './dto/create-business.dto';
import { UpdateBusinessDTO } from './dto/update-business.dto';

@Injectable()
export class BusinessesService {
	constructor(private readonly prismaService: PrismaService) {}

	private readonly select = {
		id: true,
		created_at: true,
		max_reach_level: true,
		cnpj: true,
		profile: {
			select: {
				bio: true,
				slug: true,
				display_name: true,
				avatar_url: true,
			},
		},
		categories: { select: { category: { select: { name: true } } } },
	};

	private mapBusiness(business: any) {
		return {
			id: business.id,
			slug: business.profile.slug,
			name: business.profile.display_name,
			bio: business.profile.bio,
			avatar_url: business.profile.avatar_url,
			max_reach_level: business.max_reach_level,
			cnpj: business.cnpj,
			categories: business.categories.map((c) => c.category.name),
			created_at: business.created_at,
		};
	}

	async create(dto: CreateBusinessDTO) {
		return await this.prismaService.business.create({
			data: dto,
		});
	}

	async findAll() {
		const businesses = await this.prismaService.business.findMany({
			select: this.select,
			orderBy: { created_at: 'desc' },
		});

		return businesses.map((b) => this.mapBusiness(b));
	}

	async findOne(id: string) {
		const business = await this.prismaService.business.findUnique({
			where: { id },
			select: this.select,
		});

		if (!business) {
			throw new NotFoundException();
		}

		return this.mapBusiness(business);
	}

	async update(id: string, dto: UpdateBusinessDTO) {
		const business = await this.prismaService.business.update({
			data: {
				cnpj: dto.cnpj,
				max_reach_level: dto.max_reach_level,
			},
			where: { id },
			select: this.select,
		});

		return this.mapBusiness(business);
	}

	async remove(id: string) {
		const business = await this.prismaService.business.delete({
			where: { id },
			select: this.select,
		});

		return this.mapBusiness(business);
	}
}
