import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { CategoriesService } from './categories.service';
import { CategoryEntity } from './dto/category-entity.dto';

describe('CategoriesService', () => {
	let service: CategoriesService;
	let prisma: DeepMockProxy<PrismaService>;

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
			providers: [
				CategoriesService,
				{
					provide: PrismaService,
					useValue: mockDeep<PrismaService>(),
				},
			],
		}).compile();

		service = module.get<CategoriesService>(CategoriesService);
		prisma = module.get(PrismaService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('create', () => {
		it('should create a category', async () => {
			prisma.category.create.mockResolvedValue(mockCategory);

			const result = await service.create({
				name: 'Test Category',
				parent_id: null,
				entities: [CategoryEntity.city],
			});

			expect(result).toEqual(mockCategory);
			expect(prisma.category.create).toHaveBeenCalledWith({
				data: {
					name: 'Test Category',
					parent_id: null,
					entities: [CategoryEntity.city],
				},
			});
		});
	});

	describe('findParents', () => {
		it('should return an array of parent categories', async () => {
			prisma.category.findMany.mockResolvedValue([mockCategory]);

			const result = await service.findParents();

			expect(result).toEqual([mockCategory]);
			expect(prisma.category.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({ parent_id: null }),
				}),
			);
		});

		it('should filter parent categories by entity', async () => {
			prisma.category.findMany.mockResolvedValue([mockCategory]);

			const result = await service.findParents(CategoryEntity.city);

			expect(result).toEqual([mockCategory]);
			expect(prisma.category.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						OR: expect.arrayContaining([
							{ entities: { has: CategoryEntity.city } },
						]),
					}),
				}),
			);
		});
	});

	describe('findChildren', () => {
		it('should return child categories for a parent', async () => {
			prisma.category.findMany.mockResolvedValue([mockCategory]);

			const result = await service.findChildren('parent-1');

			expect(result).toEqual([mockCategory]);
			expect(prisma.category.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({ parent_id: 'parent-1' }),
				}),
			);
		});
	});

	describe('findOne', () => {
		it('should return a category by id', async () => {
			prisma.category.findFirst.mockResolvedValue(mockCategory);

			const result = await service.findOne('category-1');

			expect(result).toEqual(mockCategory);
			expect(prisma.category.findFirst).toHaveBeenCalledWith({
				where: { id: 'category-1' },
			});
		});

		it('should throw NotFoundException when category not found', async () => {
			prisma.category.findFirst.mockResolvedValue(null);

			await expect(service.findOne('non-existent')).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('update', () => {
		it('should update a category', async () => {
			const updatedCategory = { ...mockCategory, name: 'Updated Category' };
			prisma.category.findFirst.mockResolvedValue(mockCategory);
			prisma.category.update.mockResolvedValue(updatedCategory);

			const result = await service.update('category-1', {
				name: 'Updated Category',
			});

			expect(result).toEqual(updatedCategory);
			expect(prisma.category.update).toHaveBeenCalledWith({
				where: { id: 'category-1' },
				data: { name: 'Updated Category' },
			});
		});

		it('should throw NotFoundException when category to update not found', async () => {
			prisma.category.findFirst.mockResolvedValue(null);

			await expect(
				service.update('non-existent', { name: 'Test' }),
			).rejects.toThrow(NotFoundException);
		});
	});

	describe('remove', () => {
		it('should delete a category', async () => {
			prisma.category.findFirst.mockResolvedValue(mockCategory);
			prisma.category.delete.mockResolvedValue(mockCategory);

			const result = await service.remove('category-1');

			expect(result).toEqual(mockCategory);
			expect(prisma.category.delete).toHaveBeenCalledWith({
				where: { id: 'category-1' },
			});
		});

		it('should throw NotFoundException when category to delete not found', async () => {
			prisma.category.findFirst.mockResolvedValue(null);

			await expect(service.remove('non-existent')).rejects.toThrow(
				NotFoundException,
			);
		});
	});
});
