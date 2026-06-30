import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { BusinessesService } from '../businesses.service';

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
});
