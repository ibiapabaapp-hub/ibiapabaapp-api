import {
	Injectable,
	NotFoundException,
	ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { CreateFavoriteDTO } from './dto/create-favorite.dto';

@Injectable()
export class FavoritesService {
	constructor(private readonly prismaService: PrismaService) {}

	private readonly select = {
		id: true,
		account_id: true,
		city_id: true,
		event_id: true,
		business_id: true,
	};

	async create(dto: CreateFavoriteDTO) {
		// Ensure exactly one entity type is provided
		const entityCount = [dto.city_id, dto.event_id, dto.business_id].filter(
			Boolean,
		).length;
		if (entityCount === 0) {
			throw new Error(
				'Deve ser fornecido pelo menos uma entidade (city_id, event_id ou business_id)',
			);
		}
		if (entityCount > 1) {
			throw new Error('Apenas uma entidade pode ser favoritada por vez');
		}

		// Check for existing favorite to avoid duplicates
		const existing = await this.prismaService.account_favorite.findFirst({
			where: {
				account_id: dto.account_id,
				OR: [
					dto.city_id ? { city_id: dto.city_id } : undefined,
					dto.event_id ? { event_id: dto.event_id } : undefined,
					dto.business_id ? { business_id: dto.business_id } : undefined,
				].filter(Boolean) as object[],
			},
		});

		if (existing) {
			throw new ConflictException('Este item já foi favoritado por esta conta');
		}

		return await this.prismaService.account_favorite.create({
			data: dto,
			select: this.select,
		});
	}

	async findAll(accountId?: string) {
		const where = accountId ? { account_id: accountId } : {};

		const favorites = await this.prismaService.account_favorite.findMany({
			where,
			select: this.select,
		});

		return favorites;
	}

	async findOne(id: string) {
		const favorite = await this.prismaService.account_favorite.findUnique({
			where: { id },
			select: this.select,
		});

		if (!favorite) {
			throw new NotFoundException('Favorito não encontrado');
		}

		return favorite;
	}

	async findByAccountAndCity(accountId: string, cityId: string) {
		const favorite = await this.prismaService.account_favorite.findFirst({
			where: { account_id: accountId, city_id: cityId },
			select: this.select,
		});

		return favorite;
	}

	async findByAccountAndEvent(accountId: string, eventId: string) {
		const favorite = await this.prismaService.account_favorite.findFirst({
			where: { account_id: accountId, event_id: eventId },
			select: this.select,
		});

		return favorite;
	}

	async findByAccountAndBusiness(accountId: string, businessId: string) {
		const favorite = await this.prismaService.account_favorite.findFirst({
			where: { account_id: accountId, business_id: businessId },
			select: this.select,
		});

		return favorite;
	}

	async remove(id: string) {
		const favorite = await this.prismaService.account_favorite.delete({
			where: { id },
			select: this.select,
		});

		return favorite;
	}

	async removeByCity(accountId: string, cityId: string) {
		await this.prismaService.account_favorite.deleteMany({
			where: { account_id: accountId, city_id: cityId },
		});
	}

	async removeByEvent(accountId: string, eventId: string) {
		await this.prismaService.account_favorite.deleteMany({
			where: { account_id: accountId, event_id: eventId },
		});
	}

	async removeByBusiness(accountId: string, businessId: string) {
		await this.prismaService.account_favorite.deleteMany({
			where: { account_id: accountId, business_id: businessId },
		});
	}
}
