import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { Lead } from './entities/lead.entity';

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
        type: 'resident',
        phone_number: '(11) 9 9999-9999',
      };

      prisma.leads.create.mockResolvedValue(dto as Lead);

      const result = await service.create(dto);

      expect(prisma.leads.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(dto);
    });
  });

  describe('findAll', () => {
    it('should return all leads', async () => {
      const list = [{ id: '123' }];
      prisma.leads.findMany.mockResolvedValue(list as Lead[]);

      const result = await service.findAll();

      expect(prisma.leads.findMany).toHaveBeenCalled();
      expect(result).toEqual(list);
    });
  });

  describe('findOne', () => {
    it('should return a lead if found', async () => {
      const lead = { id: '123' };
      prisma.leads.findFirst.mockResolvedValue(lead as Lead);

      const result = await service.findOne('123');

      expect(prisma.leads.findFirst).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      expect(result).toEqual(lead);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.leads.findFirst.mockResolvedValue(null);

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

      prisma.leads.findFirst.mockResolvedValue(existingLead as Lead);
      prisma.leads.update.mockResolvedValue(updatedLead as Lead);

      const result = await service.update('123', { name: 'Updated' });

      expect(prisma.leads.findFirst).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      expect(prisma.leads.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: { name: 'Updated' },
      });
      expect(result).toEqual(updatedLead);
    });

    it('should throw NotFoundException if lead does not exist', async () => {
      prisma.leads.findFirst.mockResolvedValue(null);

      await expect(service.update('123', { name: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );

      expect(prisma.leads.update).not.toHaveBeenCalled();
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

      prisma.leads.findFirst.mockResolvedValue(existingLead as Lead);
      prisma.leads.delete.mockResolvedValue(existingLead as Lead);

      const result = await service.remove('123');

      expect(prisma.leads.findFirst).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      expect(prisma.leads.delete).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      expect(result).toEqual({ message: 'Lead deleted successfully' });
    });

    it('should throw NotFoundException if lead does not exist', async () => {
      prisma.leads.findFirst.mockResolvedValue(null);

      await expect(service.remove('123')).rejects.toThrow(NotFoundException);

      expect(prisma.leads.delete).not.toHaveBeenCalled();
    });
  });
});
