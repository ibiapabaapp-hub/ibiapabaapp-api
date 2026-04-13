import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { CompaniesService } from '../companies.service';

describe('CompaniesService', () => {
	let service: CompaniesService;
	let prisma: DeepMockProxy<PrismaService>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CompaniesService,
				{ provide: PrismaService, useValue: mockDeep<PrismaService>() },
			],
		}).compile();

		service = module.get<CompaniesService>(CompaniesService);
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
			prisma.company.findMany.mockResolvedValue(mockPrismaResponse as any);

			const result = await service.findAll();

			expect(result[0].name).toBe('Empresa A');
			expect(result[0].categories).toEqual(['Alimentação', 'Turismo']);
			expect(prisma.company.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					include: expect.anything(),
					orderBy: { name: 'asc' },
				}),
			);
		});
	});

	describe('findOne', () => {
		it('should throw NotFoundException if company does not exist', async () => {
			prisma.company.findUnique.mockResolvedValue(null);
			await expect(service.findOne('uuid')).rejects.toThrow(NotFoundException);
		});

		it('should return a single company with flattened categories', async () => {
			const mockCompany = {
				id: '1',
				name: 'Empresa B',
				categories: [{ category: { name: 'Tecnologia' } }],
			};

			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			prisma.company.findUnique.mockResolvedValue(mockCompany as any);

			const result = await service.findOne('1');

			expect(result.id).toBe('1');
			expect(result.categories).toEqual(['Tecnologia']);
			expect(prisma.company.findUnique).toHaveBeenCalled();
		});
	});

	describe('remove', () => {
		it('should call prisma delete with correct id', async () => {
			const id = 'uuid-teste';
			await service.remove(id);
			expect(prisma.company.delete).toHaveBeenCalledWith({ where: { id } });
		});
	});
});
