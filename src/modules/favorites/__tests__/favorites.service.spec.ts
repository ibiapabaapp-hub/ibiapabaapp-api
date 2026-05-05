import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { FavoritesService } from '../favorites.service';

describe('FavoritesService', () => {
	let service: FavoritesService;
	let prisma: DeepMockProxy<PrismaService>;

	const mockFavorite = {
		id: 'favorite-1',
		profile_id: 'profile-1',
		city_id: 'city-1',
		event_id: null,
		business_profile_id: null,
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				FavoritesService,
				{
					provide: PrismaService,
					useValue: mockDeep<PrismaService>(),
				},
			],
		}).compile();

		service = module.get<FavoritesService>(FavoritesService);
		prisma = module.get(PrismaService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('create', () => {
		it('should create a favorite for a city', async () => {
			prisma.profile_favorite.create.mockResolvedValue(mockFavorite);
			prisma.profile_favorite.findFirst.mockResolvedValue(null);

			const dto = {
				profile_id: 'profile-1',
				city_id: 'city-1',
				event_id: null,
				business_profile_id: null,
			};

			const result = await service.create(dto);

			expect(result).toEqual(mockFavorite);
			expect(prisma.profile_favorite.create).toHaveBeenCalledWith({
				data: dto,
				select: expect.any(Object),
			});
		});

		it('should create a favorite for an event', async () => {
			const eventFavorite = { ...mockFavorite, city_id: null, event_id: 'event-1' };
			prisma.profile_favorite.create.mockResolvedValue(eventFavorite);
			prisma.profile_favorite.findFirst.mockResolvedValue(null);

			const dto = {
				profile_id: 'profile-1',
				city_id: null,
				event_id: 'event-1',
				business_profile_id: null,
			};

			const result = await service.create(dto);

			expect(result).toEqual(eventFavorite);
		});

		it('should create a favorite for a business', async () => {
			const businessFavorite = { ...mockFavorite, city_id: null, event_id: null, business_profile_id: 'business-1' };
			prisma.profile_favorite.create.mockResolvedValue(businessFavorite);
			prisma.profile_favorite.findFirst.mockResolvedValue(null);

			const dto = {
				profile_id: 'profile-1',
				city_id: null,
				event_id: null,
				business_profile_id: 'business-1',
			};

			const result = await service.create(dto);

			expect(result).toEqual(businessFavorite);
		});

		it('should throw error if no entity is provided', async () => {
			const dto = {
				profile_id: 'profile-1',
				city_id: null,
				event_id: null,
				business_profile_id: null,
			};

			await expect(service.create(dto)).rejects.toThrow(
				'Deve ser fornecido pelo menos uma entidade (city_id, event_id ou business_profile_id)',
			);
		});

		it('should throw error if multiple entities are provided', async () => {
			const dto = {
				profile_id: 'profile-1',
				city_id: 'city-1',
				event_id: 'event-1',
				business_profile_id: null,
			};

			await expect(service.create(dto)).rejects.toThrow(
				'Apenas uma entidade pode ser favoritada por vez',
			);
		});

		it('should throw ConflictException if already favorited', async () => {
			prisma.profile_favorite.findFirst.mockResolvedValue(mockFavorite);

			const dto = {
				profile_id: 'profile-1',
				city_id: 'city-1',
				event_id: null,
				business_profile_id: null,
			};

			await expect(service.create(dto)).rejects.toThrow('Este item já foi favoritado por este perfil');
		});
	});

	describe('findAll', () => {
		it('should return an array of favorites', async () => {
			const favorites = [mockFavorite, { ...mockFavorite, id: 'favorite-2' }];
			prisma.profile_favorite.findMany.mockResolvedValue(favorites);

			const result = await service.findAll();

			expect(result).toEqual(favorites);
			expect(prisma.profile_favorite.findMany).toHaveBeenCalledWith({
				where: {},
				select: expect.any(Object),
			});
		});

		it('should filter favorites by profile_id', async () => {
			const favorites = [mockFavorite];
			prisma.profile_favorite.findMany.mockResolvedValue(favorites);

			await service.findAll('profile-1');

			expect(prisma.profile_favorite.findMany).toHaveBeenCalledWith({
				where: { profile_id: 'profile-1' },
				select: expect.any(Object),
			});
		});
	});

	describe('findOne', () => {
		it('should return a favorite by id', async () => {
			prisma.profile_favorite.findUnique.mockResolvedValue(mockFavorite);

			const result = await service.findOne('favorite-1');

			expect(result).toEqual(mockFavorite);
			expect(prisma.profile_favorite.findUnique).toHaveBeenCalledWith({
				where: { id: 'favorite-1' },
				select: expect.any(Object),
			});
		});

		it('should throw NotFoundException when favorite not found', async () => {
			prisma.profile_favorite.findUnique.mockResolvedValue(null);

			await expect(service.findOne('non-existent')).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('remove', () => {
		it('should delete a favorite', async () => {
			prisma.profile_favorite.delete.mockResolvedValue(mockFavorite);

			const result = await service.remove('favorite-1');

			expect(result).toEqual(mockFavorite);
			expect(prisma.profile_favorite.delete).toHaveBeenCalledWith({
				where: { id: 'favorite-1' },
				select: expect.any(Object),
			});
		});

		it('should throw NotFoundException when favorite to delete not found', async () => {
			prisma.profile_favorite.delete.mockRejectedValue(new Error('Not found'));

			await expect(service.remove('non-existent')).rejects.toThrow();
		});
	});

	describe('removeByCity', () => {
		it('should remove favorite by profile and city', async () => {
			prisma.profile_favorite.deleteMany.mockResolvedValue({} as any);

			await service.removeByCity('profile-1', 'city-1');

			expect(prisma.profile_favorite.deleteMany).toHaveBeenCalledWith({
				where: { profile_id: 'profile-1', city_id: 'city-1' },
			});
		});
	});

	describe('removeByEvent', () => {
		it('should remove favorite by profile and event', async () => {
			prisma.profile_favorite.deleteMany.mockResolvedValue({} as any);

			await service.removeByEvent('profile-1', 'event-1');

			expect(prisma.profile_favorite.deleteMany).toHaveBeenCalledWith({
				where: { profile_id: 'profile-1', event_id: 'event-1' },
			});
		});
	});

	describe('removeByBusiness', () => {
		it('should remove favorite by profile and business', async () => {
			prisma.profile_favorite.deleteMany.mockResolvedValue({} as any);

			await service.removeByBusiness('profile-1', 'business-1');

			expect(prisma.profile_favorite.deleteMany).toHaveBeenCalledWith({
				where: { profile_id: 'profile-1', business_profile_id: 'business-1' },
			});
		});
	});
});
