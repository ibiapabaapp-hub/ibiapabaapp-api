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
		account_id: 'account-1',
		city_id: 'city-1',
		event_id: null,
		business_id: null,
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
			prisma.account_favorite.create.mockResolvedValue(mockFavorite);
			prisma.account_favorite.findFirst.mockResolvedValue(null);

			const dto = {
				account_id: 'account-1',
				city_id: 'city-1',
				event_id: null,
				business_id: null,
			};

			const result = await service.create(dto);

			expect(result).toEqual(mockFavorite);
			expect(prisma.account_favorite.create).toHaveBeenCalledWith({
				data: dto,
				select: expect.any(Object),
			});
		});

		it('should create a favorite for an event', async () => {
			const eventFavorite = {
				...mockFavorite,
				city_id: null,
				event_id: 'event-1',
			};
			prisma.account_favorite.create.mockResolvedValue(eventFavorite);
			prisma.account_favorite.findFirst.mockResolvedValue(null);

			const dto = {
				account_id: 'account-1',
				city_id: null,
				event_id: 'event-1',
				business_id: null,
			};

			const result = await service.create(dto);

			expect(result).toEqual(eventFavorite);
		});

		it('should create a favorite for a business', async () => {
			const businessFavorite = {
				...mockFavorite,
				city_id: null,
				event_id: null,
				business_id: 'business-1',
			};
			prisma.account_favorite.create.mockResolvedValue(businessFavorite);
			prisma.account_favorite.findFirst.mockResolvedValue(null);

			const dto = {
				account_id: 'account-1',
				city_id: null,
				event_id: null,
				business_id: 'business-1',
			};

			const result = await service.create(dto);

			expect(result).toEqual(businessFavorite);
		});

		it('should throw error if no entity is provided', async () => {
			const dto = {
				account_id: 'account-1',
				city_id: null,
				event_id: null,
				business_id: null,
			};

			await expect(service.create(dto)).rejects.toThrow(
				'Deve ser fornecido pelo menos uma entidade (city_id, event_id ou business_id)',
			);
		});

		it('should throw error if multiple entities are provided', async () => {
			const dto = {
				account_id: 'account-1',
				city_id: 'city-1',
				event_id: 'event-1',
				business_id: null,
			};

			await expect(service.create(dto)).rejects.toThrow(
				'Apenas uma entidade pode ser favoritada por vez',
			);
		});

		it('should throw ConflictException if already favorited', async () => {
			prisma.account_favorite.findFirst.mockResolvedValue(mockFavorite);

			const dto = {
				account_id: 'account-1',
				city_id: 'city-1',
				event_id: null,
				business_id: null,
			};

			await expect(service.create(dto)).rejects.toThrow(
				'Este item já foi favoritado por esta conta',
			);
		});
	});

	describe('findAll', () => {
		it('should return an array of favorites', async () => {
			const favorites = [mockFavorite, { ...mockFavorite, id: 'favorite-2' }];
			prisma.account_favorite.findMany.mockResolvedValue(favorites);

			const result = await service.findAll();

			expect(result).toEqual(favorites);
			expect(prisma.account_favorite.findMany).toHaveBeenCalledWith({
				where: {},
				select: expect.any(Object),
			});
		});

		it('should filter favorites by profile_id', async () => {
			const favorites = [mockFavorite];
			prisma.account_favorite.findMany.mockResolvedValue(favorites);

			await service.findAll('account-1');

			expect(prisma.account_favorite.findMany).toHaveBeenCalledWith({
				where: { account_id: 'account-1' },
				select: expect.any(Object),
			});
		});
	});

	describe('findOne', () => {
		it('should return a favorite by id', async () => {
			prisma.account_favorite.findUnique.mockResolvedValue(mockFavorite);

			const result = await service.findOne('favorite-1');

			expect(result).toEqual(mockFavorite);
			expect(prisma.account_favorite.findUnique).toHaveBeenCalledWith({
				where: { id: 'favorite-1' },
				select: expect.any(Object),
			});
		});

		it('should throw NotFoundException when favorite not found', async () => {
			prisma.account_favorite.findUnique.mockResolvedValue(null);

			await expect(service.findOne('non-existent')).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('remove', () => {
		it('should delete a favorite', async () => {
			prisma.account_favorite.delete.mockResolvedValue(mockFavorite);

			const result = await service.remove('favorite-1');

			expect(result).toEqual(mockFavorite);
			expect(prisma.account_favorite.delete).toHaveBeenCalledWith({
				where: { id: 'favorite-1' },
				select: expect.any(Object),
			});
		});

		it('should throw NotFoundException when favorite to delete not found', async () => {
			prisma.account_favorite.delete.mockRejectedValue(new Error('Not found'));

			await expect(service.remove('non-existent')).rejects.toThrow();
		});
	});

	describe('removeByCity', () => {
		it('should remove favorite by profile and city', async () => {
			prisma.account_favorite.deleteMany.mockResolvedValue({} as any);

			await service.removeByCity('account-1', 'city-1');

			expect(prisma.account_favorite.deleteMany).toHaveBeenCalledWith({
				where: { account_id: 'account-1', city_id: 'city-1' },
			});
		});
	});

	describe('removeByEvent', () => {
		it('should remove favorite by profile and event', async () => {
			prisma.account_favorite.deleteMany.mockResolvedValue({} as any);

			await service.removeByEvent('account-1', 'event-1');

			expect(prisma.account_favorite.deleteMany).toHaveBeenCalledWith({
				where: { account_id: 'account-1', event_id: 'event-1' },
			});
		});
	});

	describe('removeByBusiness', () => {
		it('should remove favorite by profile and business', async () => {
			prisma.account_favorite.deleteMany.mockResolvedValue({} as any);

			await service.removeByBusiness('account-1', 'business-1');

			expect(prisma.account_favorite.deleteMany).toHaveBeenCalledWith({
				where: { account_id: 'account-1', business_id: 'business-1' },
			});
		});
	});
});
