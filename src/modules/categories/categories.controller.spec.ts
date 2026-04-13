import { Test, TestingModule } from '@nestjs/testing';

import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoryEntity } from './dto/category-entity.dto';

describe('CategoriesController', () => {
	let controller: CategoriesController;
	let service: CategoriesService;

	const mockCategory = {
		id: 'category-1',
		name: 'Test Category',
		parent_id: null,
		entities: [CategoryEntity.city],
		created_at: new Date(),
		updated_at: new Date(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [CategoriesController],
			providers: [
				{
					provide: CategoriesService,
					useValue: {
						create: jest.fn(),
						findParents: jest.fn(),
						findChildren: jest.fn(),
						findOne: jest.fn(),

						update: jest.fn(),
						remove: jest.fn(),
					},
				},
			],
		}).compile();

		controller = module.get<CategoriesController>(CategoriesController);
		service = module.get<CategoriesService>(CategoriesService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('create', () => {
		it('should create a category', async () => {
			jest.spyOn(service, 'create').mockResolvedValue(mockCategory);

			const result = await controller.create({
				name: 'Test Category',
				parent_id: null,
				entities: [CategoryEntity.city],
			});

			expect(result).toEqual(mockCategory);
			expect(service.create).toHaveBeenCalledWith({
				name: 'Test Category',
				parent_id: null,
				entities: [CategoryEntity.city],
			});
		});
	});

	describe('getParents', () => {
		const mockParentCategory = {
			id: 'category-1',
			name: 'Test Category',
			entities: [CategoryEntity.city],
			children: [],
		};

		it('should return an array of categories', async () => {
			jest
				.spyOn(service, 'findParents')
				.mockResolvedValue([mockParentCategory as any]);

			const result = await controller.getParents(undefined);

			expect(result).toEqual([mockParentCategory]);
			expect(service.findParents).toHaveBeenCalledWith(undefined);
		});

		it('should return empty array when no categories exist', async () => {
			jest.spyOn(service, 'findParents').mockResolvedValue([]);

			const result = await controller.getParents(undefined);

			expect(result).toEqual([]);
		});

		it('should filter by entity', async () => {
			jest
				.spyOn(service, 'findParents')
				.mockResolvedValue([mockParentCategory as any]);

			const result = await controller.getParents(CategoryEntity.city);

			expect(result).toEqual([mockParentCategory]);
			expect(service.findParents).toHaveBeenCalledWith(CategoryEntity.city);
		});
	});

	describe('getChildren', () => {
		const mockChildCategory = {
			id: 'child-1',
			name: 'Child Category',
			entities: [CategoryEntity.city],
		};

		it('should return child categories', async () => {
			jest
				.spyOn(service, 'findChildren')
				.mockResolvedValue([mockChildCategory as any]);

			const result = await controller.getChildren('parent-1', undefined);

			expect(result).toEqual([mockChildCategory]);
			expect(service.findChildren).toHaveBeenCalledWith('parent-1', undefined);
		});
	});

	describe('findOne', () => {
		it('should return a category by id', async () => {
			jest.spyOn(service, 'findOne').mockResolvedValue(mockCategory);

			const result = await controller.findOne('category-1');

			expect(result).toEqual(mockCategory);
			expect(service.findOne).toHaveBeenCalledWith('category-1');
		});
	});

	describe('update', () => {
		it('should update a category', async () => {
			const updatedCategory = { ...mockCategory, name: 'Updated Category' };
			jest.spyOn(service, 'update').mockResolvedValue(updatedCategory);

			const result = await controller.update('category-1', {
				name: 'Updated Category',
			});

			expect(result).toEqual(updatedCategory);
			expect(service.update).toHaveBeenCalledWith('category-1', {
				name: 'Updated Category',
			});
		});
	});

	describe('remove', () => {
		it('should delete a category', async () => {
			jest.spyOn(service, 'remove').mockResolvedValue(mockCategory);

			const result = await controller.remove('category-1');

			expect(result).toEqual(mockCategory);
			expect(service.remove).toHaveBeenCalledWith('category-1');
		});
	});
});
