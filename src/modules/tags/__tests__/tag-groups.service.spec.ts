import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { TagGroupsService } from '../tag-groups.service';

describe('TagGroupsService', () => {
	let service: TagGroupsService;
	let prisma: DeepMockProxy<PrismaService>;

	const mockGroup = {
		id: 'group-1',
		name: 'Test Group',
		description: 'A test group',
		created_at: new Date(),
		updated_at: new Date(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TagGroupsService,
				{
					provide: PrismaService,
					useValue: mockDeep<PrismaService>(),
				},
			],
		}).compile();

		service = module.get<TagGroupsService>(TagGroupsService);
		prisma = module.get(PrismaService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('create', () => {
		it('should create a tag group', async () => {
			prisma.tag_group.create.mockResolvedValue(mockGroup);

			const result = await service.create({
				name: 'Test Group',
				description: 'A test group',
			});

			expect(result).toEqual(mockGroup);
			expect(prisma.tag_group.create).toHaveBeenCalledWith({
				data: { name: 'Test Group', description: 'A test group' },
			});
		});
	});

	describe('findAll', () => {
		it('should return all tag groups with tags', async () => {
			const groupWithTags = { ...mockGroup, tags: [] };
			prisma.tag_group.findMany.mockResolvedValue([groupWithTags]);

			const result = await service.findAll();

			expect(result).toEqual([groupWithTags]);
			expect(prisma.tag_group.findMany).toHaveBeenCalledWith({
				include: { tags: { orderBy: { position: 'asc' } } },
				orderBy: { name: 'asc' },
			});
		});
	});

	describe('findOne', () => {
		it('should return a tag group by id', async () => {
			const groupWithTags = { ...mockGroup, tags: [] };
			prisma.tag_group.findUnique.mockResolvedValue(groupWithTags);

			const result = await service.findOne('group-1');

			expect(result).toEqual(groupWithTags);
			expect(prisma.tag_group.findUnique).toHaveBeenCalledWith({
				where: { id: 'group-1' },
				include: { tags: { orderBy: { position: 'asc' } } },
			});
		});

		it('should throw NotFoundException when group not found', async () => {
			prisma.tag_group.findUnique.mockResolvedValue(null);

			await expect(service.findOne('non-existent')).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('update', () => {
		it('should update a tag group', async () => {
			const updatedGroup = {
				...mockGroup,
				name: 'Updated Group',
			};
			prisma.tag_group.findUnique.mockResolvedValue(mockGroup);
			prisma.tag_group.update.mockResolvedValue(updatedGroup);

			const result = await service.update('group-1', {
				name: 'Updated Group',
			});

			expect(result).toEqual(updatedGroup);
			expect(prisma.tag_group.update).toHaveBeenCalledWith({
				where: { id: 'group-1' },
				data: { name: 'Updated Group' },
			});
		});

		it('should throw NotFoundException when group to update not found', async () => {
			prisma.tag_group.findUnique.mockResolvedValue(null);

			await expect(
				service.update('non-existent', { name: 'Test' }),
			).rejects.toThrow(NotFoundException);
		});
	});

	describe('remove', () => {
		it('should delete a tag group', async () => {
			prisma.tag_group.findUnique.mockResolvedValue(mockGroup);
			prisma.tag_group.delete.mockResolvedValue(mockGroup);

			const result = await service.remove('group-1');

			expect(result).toEqual(mockGroup);
			expect(prisma.tag_group.delete).toHaveBeenCalledWith({
				where: { id: 'group-1' },
			});
		});

		it('should throw NotFoundException when group to delete not found', async () => {
			prisma.tag_group.findUnique.mockResolvedValue(null);

			await expect(service.remove('non-existent')).rejects.toThrow(
				NotFoundException,
			);
		});
	});
});
