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
		it('should return a list of companies with mapped category names', async () => {
			const mockPrismaResponse = [
				{
					id: '1',
					name: 'Empresa A',
					categories: [
						{ category: { name: 'Alimentação' } },
						{ category: { name: 'Turismo' } },
					],
				},
			];

			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			prisma.business.findMany.mockResolvedValue(mockPrismaResponse as any);

			const result = await service.findAll();

			expect(result[0].categories).toEqual(['Alimentação', 'Turismo']);
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

		it('should return a single business with flattened categories', async () => {
			const mockBusiness = {
				id: '1',
				name: 'Empresa B',
				categories: [{ category: { name: 'Tecnologia' } }],
			};

			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			prisma.business.findUnique.mockResolvedValue(mockBusiness as any);

			const result = await service.findOne('1');

			expect(result.id).toBe('1');
			expect(result.categories).toEqual(['Tecnologia']);
			expect(prisma.business.findUnique).toHaveBeenCalled();
		});
	});

	describe('remove', () => {
		it('should call prisma delete with correct id', async () => {
			const id = 'uuid-teste';
			await service.remove(id);
			expect(prisma.business.delete).toHaveBeenCalledWith({
				where: { id },
			});
		});
	});
});
