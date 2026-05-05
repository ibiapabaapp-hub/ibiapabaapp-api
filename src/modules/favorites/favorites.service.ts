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
		profile_id: true,
		city_id: true,
		event_id: true,
		business_profile_id: true,
	};

	async create(dto: CreateFavoriteDTO) {
		// Ensure exactly one entity type is provided
		const entityCount = [
			dto.city_id,
			dto.event_id,
			dto.business_profile_id,
		].filter(Boolean).length;
		if (entityCount === 0) {
			throw new Error(
				'Deve ser fornecido pelo menos uma entidade (city_id, event_id ou business_profile_id)',
			);
		}
		if (entityCount > 1) {
			throw new Error('Apenas uma entidade pode ser favoritada por vez');
		}

		// Check for existing favorite to avoid duplicates
		const existing = await this.prismaService.profile_favorite.findFirst({
			where: {
				profile_id: dto.profile_id,
				OR: [
					dto.city_id ? { city_id: dto.city_id } : undefined,
					dto.event_id ? { event_id: dto.event_id } : undefined,
					dto.business_profile_id
						? { business_profile_id: dto.business_profile_id }
						: undefined,
				].filter(Boolean) as object[],
			},
		});

		if (existing) {
			throw new ConflictException(
				'Este item já foi favoritado por este perfil',
			);
		}

		return await this.prismaService.profile_favorite.create({
			data: dto,
			select: this.select,
		});
	}

	async findAll(profileId?: string) {
		const where = profileId ? { profile_id: profileId } : {};

		const favorites = await this.prismaService.profile_favorite.findMany({
			where,
			select: this.select,
		});

		return favorites;
	}

	async findOne(id: string) {
		const favorite = await this.prismaService.profile_favorite.findUnique({
			where: { id },
			select: this.select,
		});

		if (!favorite) {
			throw new NotFoundException('Favorito não encontrado');
		}

		return favorite;
	}

	async findByProfileAndCity(profileId: string, cityId: string) {
		const favorite = await this.prismaService.profile_favorite.findFirst({
			where: { profile_id: profileId, city_id: cityId },
			select: this.select,
		});

		return favorite;
	}

	async findByProfileAndEvent(profileId: string, eventId: string) {
		const favorite = await this.prismaService.profile_favorite.findFirst({
			where: { profile_id: profileId, event_id: eventId },
			select: this.select,
		});

		return favorite;
	}

	async findByProfileAndBusiness(profileId: string, businessProfileId: string) {
		const favorite = await this.prismaService.profile_favorite.findFirst({
			where: { profile_id: profileId, business_profile_id: businessProfileId },
			select: this.select,
		});

		return favorite;
	}

	async remove(id: string) {
		const favorite = await this.prismaService.profile_favorite.delete({
			where: { id },
			select: this.select,
		});

		return favorite;
	}

	async removeByCity(profileId: string, cityId: string) {
		await this.prismaService.profile_favorite.deleteMany({
			where: { profile_id: profileId, city_id: cityId },
		});
	}

	async removeByEvent(profileId: string, eventId: string) {
		await this.prismaService.profile_favorite.deleteMany({
			where: { profile_id: profileId, event_id: eventId },
		});
	}

	async removeByBusiness(profileId: string, businessProfileId: string) {
		await this.prismaService.profile_favorite.deleteMany({
			where: { profile_id: profileId, business_profile_id: businessProfileId },
		});
	}
}
