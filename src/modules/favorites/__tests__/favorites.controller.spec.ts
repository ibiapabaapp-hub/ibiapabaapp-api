import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { FavoritesController } from '../favorites.controller';
import { FavoritesService } from '../favorites.service';

describe('FavoritesController', () => {
	let controller: FavoritesController;
	let service: DeepMockProxy<FavoritesService>;

	const mockFavorite = {
		id: 'favorite-1',
		account_id: 'account-1',
		city_id: 'city-1',
		event_id: null,
		business_id: null,
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [FavoritesController],
			providers: [
				{
					provide: FavoritesService,
					useValue: mockDeep<FavoritesService>(),
				},
			],
		}).compile();

		controller = module.get<FavoritesController>(FavoritesController);
		service = module.get(FavoritesService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('create', () => {
		it('should create a favorite', async () => {
			jest.spyOn(service, 'create').mockResolvedValue(mockFavorite);

			const dto = {
				account_id: 'account-1',
				city_id: 'city-1',
				event_id: null,
				business_id: null,
			};

			const result = await controller.create(dto);

			expect(result).toEqual(mockFavorite);
			expect(service.create).toHaveBeenCalledWith(dto);
		});
	});

	describe('findAll', () => {
		it('should return all favorites', async () => {
			const favorites = [mockFavorite, { ...mockFavorite, id: 'favorite-2' }];
			jest.spyOn(service, 'findAll').mockResolvedValue(favorites);

			const result = await controller.findAll();

			expect(result).toEqual(favorites);
			expect(service.findAll).toHaveBeenCalledWith(undefined);
		});

		it('should filter favorites by account_id', async () => {
			const favorites = [mockFavorite];
			jest.spyOn(service, 'findAll').mockResolvedValue(favorites);

			await controller.findAll('account-1');

			expect(service.findAll).toHaveBeenCalledWith('account-1');
		});
	});

	describe('findOne', () => {
		it('should return a favorite by id', async () => {
			jest.spyOn(service, 'findOne').mockResolvedValue(mockFavorite);

			const result = await controller.findOne('favorite-1');

			expect(result).toEqual(mockFavorite);
			expect(service.findOne).toHaveBeenCalledWith('favorite-1');
		});
	});

	describe('remove', () => {
		it('should remove a favorite', async () => {
			jest.spyOn(service, 'remove').mockResolvedValue(mockFavorite);

			const result = await controller.remove('favorite-1');

			expect(result).toEqual(mockFavorite);
			expect(service.remove).toHaveBeenCalledWith('favorite-1');
		});
	});
});
