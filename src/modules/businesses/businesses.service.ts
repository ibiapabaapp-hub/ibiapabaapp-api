import { Injectable, NotFoundException } from '@nestjs/common';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { BusinessOnboardingDto } from './dto/business-onboarding.dto';
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
		account: {
			select: {
				id: true,
				bio: true,
				slug: true,
				display_name: true,
				avatar_url: true,
				type: true,
			},
		},
		tags: { select: { tag: { select: { name: true } } } },
	};

	private mapBusiness(business: any) {
		return {
			id: business.id,
			account_id: business.account.id,
			slug: business.account.slug,
			name: business.account.display_name,
			bio: business.account.bio,
			avatar_url: business.account.avatar_url,
			type: business.account.type,
			max_reach_level: business.max_reach_level,
			cnpj: business.cnpj,
			tags: business.tags.map((t) => t.tag.name),
			created_at: business.created_at,
		};
	}

	async create(dto: CreateBusinessDTO) {
		return await this.prismaService.business.create({
			data: {
				owner_account_id: dto.account_id,
				cnpj: dto.cnpj,
				max_reach_level: dto.max_reach_level,
			},
		});
	}

	async onboard(accountId: string, dto: BusinessOnboardingDto) {
		const branchCityIds = [...new Set(dto.branch_city_ids ?? [])].filter(
			(cityId) => cityId !== dto.headquarters_city_id,
		);
		const cityIds = [dto.headquarters_city_id, ...branchCityIds];

		try {
			const result = await this.prismaService.$transaction(async (tx) => {
				const account = await tx.account.findUnique({
					where: { id: accountId },
					select: { id: true, type: true, business: { select: { id: true } } },
				});
				if (!account) throw new NotFoundException('Account not found');
				if (account.type !== 'business') {
					throw new BadRequestException('Account must be of business type');
				}
				if (account.business) {
					throw new ConflictException('Account already has a business');
				}

				const cities = await tx.city.findMany({
					where: { id: { in: cityIds } },
					select: { id: true, name: true, slug: true },
				});
				if (cities.length !== cityIds.length) {
					throw new NotFoundException('One or more cities were not found');
				}

				const business = await tx.business.create({
					data: {
						owner_account_id: accountId,
						cnpj: dto.cnpj,
						cities: {
							create: cityIds.map((cityId) => ({
								city_id: cityId,
								is_headquarter: cityId === dto.headquarters_city_id,
							})),
						},
					},
					include: {
						account: { select: { id: true, display_name: true } },
						cities: {
							include: {
								city: { select: { id: true, name: true, slug: true } },
							},
						},
					},
				});
				await tx.account.update({
					where: { id: accountId },
					data: { display_name: dto.name },
				});
				return business;
			});

			return {
				id: result.id,
				account_id: result.owner_account_id,
				owner_account_id: result.owner_account_id,
				name: dto.name,
				cnpj: result.cnpj,
				headquarters_city_id: dto.headquarters_city_id,
				branch_city_ids: branchCityIds,
				headquarters_city: result.cities.find((city) => city.is_headquarter)
					?.city,
				branch_cities: result.cities
					.filter((city) => !city.is_headquarter)
					.map((city) => city.city),
				max_reach_level: result.max_reach_level,
				created_at: result.created_at,
				updated_at: result.updated_at,
			};
		} catch (error) {
			if (
				error instanceof NotFoundException ||
				error instanceof BadRequestException ||
				error instanceof ConflictException
			)
				throw error;
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2002'
			) {
				throw new ConflictException('Account already has a business');
			}
			throw error;
		}
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
