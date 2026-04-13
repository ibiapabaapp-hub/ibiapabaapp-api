import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { lead_type } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { Lead } from '../entities/lead.entity';
import { LeadsService } from '../leads.service';

describe('LeadsService', () => {
	let service: LeadsService;
	let prisma: DeepMockProxy<PrismaService>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				LeadsService,
				{
					provide: PrismaService,
					useValue: mockDeep<PrismaService>(),
				},
			],
		}).compile();

		service = module.get<LeadsService>(LeadsService);
		prisma = module.get(PrismaService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('create', () => {
		it('should create a new lead', async () => {
			const dto = {
				name: 'John',
				email: 'john@test.com',
				type: lead_type.company,
				phone_number: '(11) 9 9999-9999',
			};

			prisma.lead.create.mockResolvedValue(dto as Lead);

			const result = await service.create(dto);

			expect(prisma.lead.create).toHaveBeenCalledWith({ data: dto });
			expect(result).toEqual(dto);
		});
	});

	describe('findAll', () => {
		it('should return all leads', async () => {
			const list = [{ id: '123' }];
			prisma.lead.findMany.mockResolvedValue(list as Lead[]);

			const result = await service.findAll();

			expect(prisma.lead.findMany).toHaveBeenCalled();
			expect(result).toEqual(list);
		});
	});

	describe('findOne', () => {
		it('should return a lead if found', async () => {
			const lead = { id: '123' };
			prisma.lead.findFirst.mockResolvedValue(lead as Lead);

			const result = await service.findOne('123');

			expect(prisma.lead.findFirst).toHaveBeenCalledWith({
				where: { id: '123' },
			});
			expect(result).toEqual(lead);
		});

		it('should throw NotFoundException if not found', async () => {
			prisma.lead.findFirst.mockResolvedValue(null);

			await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
		});
	});

	describe('update', () => {
		it('should update a lead if it exists', async () => {
			const existingLead = {
				id: '123',
				name: 'Old Name',
				email: 'old@test.com',
				type: 'resident',
				phone_number: '(11) 9 9999-9999',
			};

			const updatedLead = {
				...existingLead,
				name: 'Updated',
			};

			prisma.lead.findFirst.mockResolvedValue(existingLead as Lead);
			prisma.lead.update.mockResolvedValue(updatedLead as Lead);

			const result = await service.update('123', { name: 'Updated' });

			expect(prisma.lead.findFirst).toHaveBeenCalledWith({
				where: { id: '123' },
			});
			expect(prisma.lead.update).toHaveBeenCalledWith({
				where: { id: '123' },
				data: { name: 'Updated' },
			});
			expect(result).toEqual(updatedLead);
		});

		it('should throw NotFoundException if lead does not exist', async () => {
			prisma.lead.findFirst.mockResolvedValue(null);

			await expect(service.update('123', { name: 'Updated' })).rejects.toThrow(
				NotFoundException,
			);

			expect(prisma.lead.update).not.toHaveBeenCalled();
		});
	});

	describe('remove', () => {
		it('should delete a lead if it exists', async () => {
			const existingLead = {
				id: '123',
				name: 'John',
				email: 'john@test.com',
				type: 'resident',
				phone_number: '(11) 9 9999-9999',
			};

			prisma.lead.findFirst.mockResolvedValue(existingLead as Lead);
			prisma.lead.delete.mockResolvedValue(existingLead as Lead);

			const result = await service.remove('123');

			expect(prisma.lead.findFirst).toHaveBeenCalledWith({
				where: { id: '123' },
			});
			expect(prisma.lead.delete).toHaveBeenCalledWith({
				where: { id: '123' },
			});
			expect(result).toEqual({ message: 'Lead deleted successfully' });
		});

		it('should throw NotFoundException if lead does not exist', async () => {
			prisma.lead.findFirst.mockResolvedValue(null);

			await expect(service.remove('123')).rejects.toThrow(NotFoundException);

			expect(prisma.lead.delete).not.toHaveBeenCalled();
		});
	});
});
