import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { JwtService } from '../../common/jwt/jwt.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Profile } from '../entities/profile.entity';
import { ProfileOwnershipGuard } from '../guards/profile-ownership.guard';
import { ProfileInterestsService } from '../interests.service';
import { ProfilesController } from '../profiles.controller';
import { ProfilesService } from '../profiles.service';

describe('ProfilesController', () => {
	let controller: ProfilesController;
	let profilesService: DeepMockProxy<ProfilesService>;
	let profileInterestsService: DeepMockProxy<ProfileInterestsService>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ProfilesController],
			providers: [
				{
					provide: ProfilesService,
					useValue: mockDeep<ProfilesService>(),
				},
				{
					provide: ProfileInterestsService,
					useValue: mockDeep<ProfileInterestsService>(),
				},
				{
					provide: JwtService,
					useValue: mockDeep<JwtService>(),
				},
				{
					provide: PrismaService,
					useValue: mockDeep<PrismaService>(),
				},
				ProfileOwnershipGuard,
			],
		}).compile();

		controller = module.get<ProfilesController>(ProfilesController);
		profilesService =
			module.get<DeepMockProxy<ProfilesService>>(ProfilesService);
		profileInterestsService = module.get<
			DeepMockProxy<ProfileInterestsService>
		>(ProfileInterestsService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('create', () => {
		it('should call profilesService.create with accountId from token and data', async () => {
			const account = { id: '123e4567-e89b-12d3-a456-426614174000' };
			const dto = {
				slug: 'test-profile',
				display_name: 'Test Profile',
				type: 'personal',
			};
			const profile = {
				id: '1',
				slug: 'test-profile',
				display_name: 'Test Profile',
				type: 'personal',
			} as unknown as Profile;

			profilesService.create.mockResolvedValue(profile);

			const result = await controller.create(account, dto);

			expect(profilesService.create).toHaveBeenCalledWith(account.id, dto);
			expect(result).toEqual(profile);
		});
	});

	describe('findAll', () => {
		it('should call profilesService.findAllByAccountId with accountId from token', async () => {
			const account = { id: '123e4567-e89b-12d3-a456-426614174000' };
			const profiles = [
				{ id: '1', slug: 'profile1', display_name: 'Profile 1' },
				{ id: '2', slug: 'profile2', display_name: 'Profile 2' },
			] as unknown as Profile[];

			profilesService.findAllByAccountId.mockResolvedValue(profiles);

			const result = await controller.findAll(account);

			expect(profilesService.findAllByAccountId).toHaveBeenCalledWith(
				account.id,
			);
			expect(result).toEqual(profiles);
		});
	});

	describe('findOne', () => {
		it('should call profilesService.findOneById with id and accountId from token', async () => {
			const account = { id: '123e4567-e89b-12d3-a456-426614174000' };
			const profileId = '123e4567-e89b-12d3-a456-426614174001';
			const profile = { id: profileId } as unknown as Profile;

			profilesService.findOneById.mockResolvedValue(profile);

			const result = await controller.findOne(profileId, account);

			expect(profilesService.findOneById).toHaveBeenCalledWith(
				profileId,
				account.id,
			);
			expect(result).toEqual(profile);
		});
	});

	describe('update', () => {
		it('should call profilesService.update with id, accountId from token and data', async () => {
			const account = { id: '123e4567-e89b-12d3-a456-426614174000' };
			const profileId = '123e4567-e89b-12d3-a456-426614174001';
			const dto = { display_name: 'Updated Name' };
			const profile = {
				id: profileId,
				display_name: 'Updated Name',
			} as unknown as Profile;

			profilesService.update.mockResolvedValue(profile);

			const result = await controller.update(profileId, account, dto);

			expect(profilesService.update).toHaveBeenCalledWith(
				profileId,
				account.id,
				dto,
			);
			expect(result).toEqual(profile);
		});
	});

	describe('remove', () => {
		it('should call profilesService.remove with id and accountId from token', async () => {
			const account = { id: '123e4567-e89b-12d3-a456-426614174000' };
			const profileId = '123e4567-e89b-12d3-a456-426614174001';
			const profile = { id: profileId } as unknown as Profile;

			profilesService.remove.mockResolvedValue(profile);

			const result = await controller.remove(profileId, account);

			expect(profilesService.remove).toHaveBeenCalledWith(
				profileId,
				account.id,
			);
			expect(result).toEqual(profile);
		});
	});

	describe('upsertInterests', () => {
		it('should call profileInterestsService.upsert with id, accountId from token and interests', async () => {
			const account = { id: '123e4567-e89b-12d3-a456-426614174000' };
			const profileId = '123e4567-e89b-12d3-a456-426614174001';
			const dto = {
				interests: ['123e4567-e89b-12d3-a456-426614174002'],
			};
			const result = {
				id: profileId,
				interests: [{ id: dto.interests[0], name: 'Category' }],
			} as unknown as Profile;

			profileInterestsService.upsert.mockResolvedValue(result);

			const controllerResult = await controller.upsertInterests(
				profileId,
				account,
				dto,
			);

			expect(profileInterestsService.upsert).toHaveBeenCalledWith(
				profileId,
				account.id,
				[{ category_id: dto.interests[0] }],
			);
			expect(controllerResult).toEqual(result);
		});
	});
});
