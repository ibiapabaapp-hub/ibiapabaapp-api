import { Test, TestingModule } from '@nestjs/testing';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { Lead } from './entities/lead.entity';

describe('LeadsController', () => {
  let controller: LeadsController;
  let service: DeepMockProxy<LeadsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadsController],
      providers: [
        {
          provide: LeadsService,
          useValue: mockDeep<LeadsService>(),
        },
      ],
    }).compile();

    controller = module.get<LeadsController>(LeadsController);
    service = module.get<DeepMockProxy<LeadsService>>(LeadsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create on create()', async () => {
    const dto = {
      name: 'John Doe',
      email: 'john@test.com',
      type: 'resident',
      phone_number: '(11) 9 9999-9999',
    };

    service.create.mockResolvedValue(dto as Lead);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(dto);
  });

  it('should call service.findAll on findAll()', async () => {
    const list = [{ id: '123' }];
    service.findAll.mockResolvedValue(list as Lead[]);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(list);
  });

  it('should call service.findOne on findOne()', async () => {
    const lead = { id: '123' };
    service.findOne.mockResolvedValue(lead as Lead);

    const result = await controller.findOne('123');

    expect(service.findOne).toHaveBeenCalledWith('123');
    expect(result).toEqual(lead);
  });

  it('should call service.update on update()', async () => {
    const dto = { name: 'Updated' };
    const updatedLead = {
      id: '123',
      name: 'Updated',
      email: 'john@test.com',
      type: 'resident',
      phone_number: '(11) 9 9999-9999',
      company_name: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    service.update.mockResolvedValue(updatedLead as Lead);

    const result = await controller.update('123', dto);

    expect(service.update).toHaveBeenCalledWith('123', dto);
    expect(result).toEqual(updatedLead);
  });

  it('should call service.remove on remove()', async () => {
    const deleteResponse = { message: 'Lead deleted successfully' };
    service.remove.mockResolvedValue(deleteResponse);

    const result = await controller.remove('123');

    expect(service.remove).toHaveBeenCalledWith('123');
    expect(result).toEqual(deleteResponse);
  });
});
