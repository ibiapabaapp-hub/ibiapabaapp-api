import {
	BadRequestException,
	ConflictException,
	NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { BusinessesService } from '../businesses.service';
import { BusinessOnboardingDto } from '../dto/business-onboarding.dto';

describe('BusinessesService', () => {
	let service: BusinessesService;
	let prisma: DeepMockProxy<PrismaService>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BusinessesService,
				{ provide: PrismaService, useValue: mockDeep<PrismaService>() },
			],
		}).compile();

		service = module.get<BusinessesService>(BusinessesService);
		prisma = module.get<DeepMockProxy<PrismaService>>(PrismaService);
	});

	describe('findAll', () => {
		it('should return a list of companies with mapped tag names', async () => {
			const mockPrismaResponse = [
				{
					id: '1',
					created_at: new Date(),
					max_reach_level: 'local',
					cnpj: '12345678',
					account: {
						id: 'account-1',
						bio: 'Test bio',
						slug: 'test-business',
						display_name: 'Test Business',
						avatar_url: 'http://example.com/avatar.jpg',
						type: 'business',
					},
					tags: [
						{ tag: { name: 'Alimentação' } },
						{ tag: { name: 'Turismo' } },
					],
				},
			];

			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			prisma.business.findMany.mockResolvedValue(mockPrismaResponse as any);

			const result = await service.findAll();

			expect(result[0].tags).toEqual(['Alimentação', 'Turismo']);
			expect(result[0].name).toBe('Test Business');
			expect(result[0].account_id).toBe('account-1');
			expect(prisma.business.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					select: expect.anything(),
					orderBy: { created_at: 'desc' },
				}),
			);
		});
	});

	describe('findOne', () => {
		it('should throw NotFoundException if business does not exist', async () => {
			prisma.business.findUnique.mockResolvedValue(null);
			await expect(service.findOne('uuid')).rejects.toThrow(NotFoundException);
		});

		it('should return a single business with flattened tags', async () => {
			const mockBusiness = {
				id: '1',
				created_at: new Date(),
				max_reach_level: 'local',
				cnpj: '12345678',
				account: {
					id: 'account-1',
					bio: 'Test bio',
					slug: 'test-business',
					display_name: 'Test Business',
					avatar_url: 'http://example.com/avatar.jpg',
					type: 'business',
				},
				tags: [{ tag: { name: 'Tecnologia' } }],
			};

			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			prisma.business.findUnique.mockResolvedValue(mockBusiness as any);

			const result = await service.findOne('1');

			expect(result.id).toBe('1');
			expect(result.name).toBe('Test Business');
			expect(result.tags).toEqual(['Tecnologia']);
			expect(prisma.business.findUnique).toHaveBeenCalled();
		});
	});

	describe('remove', () => {
		it('should call prisma delete with correct id', async () => {
			const id = 'uuid-teste';
			const mockDeletedBusiness = {
				id: 'uuid-teste',
				created_at: new Date(),
				max_reach_level: 'local',
				cnpj: '12345678',
				account: {
					id: 'account-1',
					bio: 'Test bio',
					slug: 'test-business',
					display_name: 'Test Business',
					avatar_url: 'http://example.com/avatar.jpg',
					type: 'business',
				},
				tags: [],
			};

			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			prisma.business.delete.mockResolvedValue(mockDeletedBusiness as any);

			const result = await service.remove(id);

			expect(prisma.business.delete).toHaveBeenCalledWith({
				where: { id },
				select: expect.anything(),
			});
			expect(result.id).toBe('uuid-teste');
			expect(result.name).toBe('Test Business');
		});
	});

	describe('onboard', () => {
		const dto: BusinessOnboardingDto = {
			name: 'Empresa Teste',
			cnpj: '12345678000195',
			headquarters_city_id: 'city-1',
			branch_city_ids: ['city-2', 'city-1'],
		};

		const business = {
			id: 'business-1',
			owner_account_id: 'account-1',
			cnpj: dto.cnpj,
			max_reach_level: 'local',
			created_at: new Date('2026-01-01'),
			updated_at: new Date('2026-01-01'),
			account: { id: 'account-1', display_name: dto.name },
			cities: [
				{
					is_headquarter: true,
					city: { id: 'city-1', name: 'Matriz', slug: 'matriz' },
				},
				{
					is_headquarter: false,
					city: { id: 'city-2', name: 'Filial', slug: 'filial' },
				},
			],
		};

		function configureTransaction(
			account: any = { id: 'account-1', type: 'business', business: null },
			cities = [
				{ id: 'city-1', name: 'Matriz', slug: 'matriz' },
				{ id: 'city-2', name: 'Filial', slug: 'filial' },
			],
		) {
			const tx = mockDeep<PrismaService>();
			tx.account.findUnique.mockResolvedValue(account);
			tx.city.findMany.mockResolvedValue(cities as any);
			tx.business.create.mockResolvedValue(business as any);
			tx.account.update.mockResolvedValue({} as any);
			prisma.$transaction.mockImplementation(async (callback: any) =>
				callback(tx),
			);
			return tx;
		}

		it('creates the business, updates the account name and does not duplicate headquarters', async () => {
			const tx = configureTransaction();

			const result = await service.onboard('account-1', dto);

			expect(tx.business.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						owner_account_id: 'account-1',
						cnpj: dto.cnpj,
						cities: {
							create: [
								{ city_id: 'city-1', is_headquarter: true },
								{ city_id: 'city-2', is_headquarter: false },
							],
						},
					}),
				}),
			);
			expect(tx.account.update).toHaveBeenCalledWith({
				where: { id: 'account-1' },
				data: { display_name: dto.name },
			});
			expect(result.branch_cities).toHaveLength(1);
		});

		it('rejects a missing account', async () => {
			configureTransaction(null);
			await expect(service.onboard('missing', dto)).rejects.toThrow(
				NotFoundException,
			);
		});

		it('rejects a non-business account and an existing business', async () => {
			configureTransaction({
				id: 'account-1',
				type: 'personal',
				business: null,
			});
			await expect(service.onboard('account-1', dto)).rejects.toThrow(
				BadRequestException,
			);

			configureTransaction({
				id: 'account-1',
				type: 'business',
				business: { id: 'business-1' },
			});
			await expect(service.onboard('account-1', dto)).rejects.toThrow(
				ConflictException,
			);
		});

		it('rejects when a city does not exist', async () => {
			configureTransaction(undefined, [
				{ id: 'city-1', name: 'Matriz', slug: 'matriz' },
			]);
			await expect(service.onboard('account-1', dto)).rejects.toThrow(
				NotFoundException,
			);
		});

		it('propagates a failure so the transaction rolls back', async () => {
			const tx = configureTransaction();
			tx.account.update.mockRejectedValue(new Error('update failed'));
			await expect(service.onboard('account-1', dto)).rejects.toThrow(
				'update failed',
			);
			expect(prisma.$transaction).toHaveBeenCalledTimes(1);
		});
	});
});
