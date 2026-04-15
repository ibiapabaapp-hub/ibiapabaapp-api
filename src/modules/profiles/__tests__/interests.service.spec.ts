import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { CategoryInterestInputDTO } from '../dto/update-interests.dto';
import { ProfileInterestsService } from '../interests.service';

describe('ProfileInterestsService', () => {
	let service: ProfileInterestsService;
	let prisma: DeepMockProxy<PrismaService>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ProfileInterestsService,
				{
					provide: PrismaService,
					useValue: mockDeep<PrismaService>(),
				},
			],
		}).compile();

		service = module.get<ProfileInterestsService>(ProfileInterestsService);
		prisma = module.get(PrismaService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('findAllByProfileId', () => {
		it('should return all interests for a profile', async () => {
			const interests = [
				{ category: { id: 'cat-1', name: 'Technology' } },
				{ category: { id: 'cat-2', name: 'Sports' } },
			];

			prisma.profile_interest.findMany.mockResolvedValue(interests as any);

			const result = await service.findAllByProfileId('profile-id');

			expect(prisma.profile_interest.findMany).toHaveBeenCalledWith({
				where: { profile_id: 'profile-id' },
				include: {
					category: {
						select: { id: true, name: true },
					},
				},
			});
			expect(result).toEqual([
				{ id: 'cat-1', name: 'Technology' },
				{ id: 'cat-2', name: 'Sports' },
			]);
		});

		it('should return empty array if no interests', async () => {
			prisma.profile_interest.findMany.mockResolvedValue([]);

			const result = await service.findAllByProfileId('profile-id');

			expect(result).toEqual([]);
		});
	});

	describe('upsert', () => {
		it('should replace all interests for a profile', async () => {
			const accountProfile = {
				profile_id: 'profile-id',
				account_id: 'account-id',
			};
			const interests = [{ category: { id: 'cat-1', name: 'Technology' } }];

			const dto: CategoryInterestInputDTO[] = [{ category_id: 'cat-1' }];

			prisma.account_profile.findFirst.mockResolvedValue(accountProfile as any);
			prisma.$transaction.mockResolvedValue([]);
			prisma.profile_interest.findMany.mockResolvedValue(interests as any);

			const result = await service.upsert('profile-id', 'account-id', dto);

			expect(prisma.account_profile.findFirst).toHaveBeenCalledWith({
				where: {
					profile_id: 'profile-id',
					account_id: 'account-id',
				},
			});
			expect(prisma.$transaction).toHaveBeenCalled();
			expect(result).toEqual([{ id: 'cat-1', name: 'Technology' }]);
		});

		it('should throw NotFoundException if profile does not belong to account', async () => {
			prisma.account_profile.findFirst.mockResolvedValue(null);

			const dto: CategoryInterestInputDTO[] = [{ category_id: 'cat-1' }];

			await expect(
				service.upsert('profile-id', 'account-id', dto),
			).rejects.toThrow(NotFoundException);
		});
	});
});
