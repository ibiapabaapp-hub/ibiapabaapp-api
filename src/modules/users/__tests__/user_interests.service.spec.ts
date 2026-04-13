import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { UserInterestsService } from '../user_interests.service';

describe('UserInterestsService', () => {
	let service: UserInterestsService;
	let prisma: DeepMockProxy<PrismaService>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserInterestsService,
				{
					provide: PrismaService,
					useValue: mockDeep<PrismaService>(),
				},
			],
		}).compile();

		service = module.get<UserInterestsService>(UserInterestsService);
		prisma = module.get(PrismaService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('addInterests', () => {
		it('should create user interests for multiple categories', async () => {
			const userId = 'user-1';
			const categoryIds = ['cat-1', 'cat-2', 'cat-3'];

			prisma.user_interest.createMany.mockResolvedValue({ count: 3 });

			const result = await service.addInterests(userId, categoryIds);

			expect(prisma.user_interest.createMany).toHaveBeenCalledWith({
				data: [
					{ user_id: userId, category_id: 'cat-1' },
					{ user_id: userId, category_id: 'cat-2' },
					{ user_id: userId, category_id: 'cat-3' },
				],
				skipDuplicates: true,
			});
			expect(result).toEqual({ count: 3 });
		});

		it('should create a single interest', async () => {
			const userId = 'user-1';
			const categoryIds = ['cat-1'];

			prisma.user_interest.createMany.mockResolvedValue({ count: 1 });

			const result = await service.addInterests(userId, categoryIds);

			expect(prisma.user_interest.createMany).toHaveBeenCalledWith({
				data: [{ user_id: userId, category_id: 'cat-1' }],
				skipDuplicates: true,
			});
			expect(result).toEqual({ count: 1 });
		});

		it('should handle empty category array', async () => {
			const userId = 'user-1';
			const categoryIds: string[] = [];

			prisma.user_interest.createMany.mockResolvedValue({ count: 0 });

			const result = await service.addInterests(userId, categoryIds);

			expect(prisma.user_interest.createMany).toHaveBeenCalledWith({
				data: [],
				skipDuplicates: true,
			});
			expect(result).toEqual({ count: 0 });
		});
	});

	describe('updateInterests', () => {
		it('should update user interests using a transaction', async () => {
			const userId = 'user-1';
			const companiesIds = ['cat-1', 'cat-2'];
			const eventsIds = ['cat-2', 'cat-3']; // cat-2 is in both

			// Mock transaction to just execute the callback
			prisma.$transaction.mockImplementation(async (callback) =>
				callback(prisma),
			);
			prisma.user_interest.deleteMany.mockResolvedValue({ count: 2 });
			prisma.user_interest.createMany.mockResolvedValue({ count: 3 });

			const result = await service.updateInterests(
				userId,
				companiesIds,
				eventsIds,
			);

			expect(prisma.user_interest.deleteMany).toHaveBeenCalledWith({
				where: { user_id: userId },
			});

			expect(prisma.user_interest.createMany).toHaveBeenCalledWith({
				data: expect.arrayContaining([
					{ user_id: userId, category_id: 'cat-1' },
					{ user_id: userId, category_id: 'cat-2' },
					{ user_id: userId, category_id: 'cat-3' },
				]),
				skipDuplicates: true,
			});
			expect(result).toEqual({ count: 3 });
		});

		it('should handle empty arrays', async () => {
			const userId = 'user-1';

			prisma.$transaction.mockImplementation(async (callback) =>
				callback(prisma),
			);
			prisma.user_interest.deleteMany.mockResolvedValue({ count: 0 });
			prisma.user_interest.createMany.mockResolvedValue({ count: 0 });

			const result = await service.updateInterests(userId, [], []);

			expect(prisma.user_interest.deleteMany).toHaveBeenCalled();
			expect(prisma.user_interest.createMany).toHaveBeenCalledWith({
				data: [],
				skipDuplicates: true,
			});
			expect(result).toEqual({ count: 0 });
		});
	});

	describe('listInterests', () => {
		it('should return separated interests for a user', async () => {
			const userId = 'user-1';
			const mockInterests = [
				{
					category_id: 'cat-1',
					category: {
						id: 'cat-1',
						name: 'Tech',
						entities: ['company'],
					},
				},
				{
					category_id: 'cat-2',
					category: {
						id: 'cat-2',
						name: 'UI',
						entities: ['company', 'event'],
					},
				},
				{
					category_id: 'cat-3',
					category: {
						id: 'cat-3',
						name: 'Party',
						entities: ['event'],
					},
				},
			];

			prisma.user_interest.findMany.mockResolvedValue(
				mockInterests as any,
			);

			const result = await service.listInterests(userId);

			expect(prisma.user_interest.findMany).toHaveBeenCalledWith({
				where: { user_id: userId },
				include: { category: true },
			});

			expect(result).toEqual({
				companies_ids: ['cat-1', 'cat-2'],
				events_ids: ['cat-2', 'cat-3'],
			});
		});

		it('should return empty arrays when user has no interests', async () => {
			const userId = 'user-1';

			prisma.user_interest.findMany.mockResolvedValue([]);

			const result = await service.listInterests(userId);

			expect(result).toEqual({
				companies_ids: [],
				events_ids: [],
			});
		});
	});
});
