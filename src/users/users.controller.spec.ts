import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { UserRole } from '@prisma/client';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: DeepMockProxy<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockDeep<UsersService>(),
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<DeepMockProxy<UsersService>>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.findAll on findAll()', async () => {
    const pagination = { limit: 10, offset: 0 };
    const users = [{ id: '1' }];

    service.findAll.mockResolvedValue(users as User[]);

    const result = await controller.findAll(pagination);

    expect(service.findAll).toHaveBeenCalledWith(pagination);
    expect(result).toEqual(users);
  });

  it('should call service.findOneById on findOneById()', async () => {
    const user = { id: '1' };

    service.findOneById.mockResolvedValue(user as User);

    const result = await controller.findOneById('1');

    expect(service.findOneById).toHaveBeenCalledWith('1');
    expect(result).toEqual(user);
  });

  it('should call service.update on update()', async () => {
    const dto = {
      name: 'Updated',
      password: '123456',
      role: UserRole.superuser,
    };

    const updatedUser = {
      id: '1',
      name: 'Updated',
      role: UserRole.superuser,
    };

    service.update.mockResolvedValue(updatedUser as User);

    const result = await controller.update('1', dto as UpdateUserDto);

    expect(service.update).toHaveBeenCalledWith('1', dto);
    expect(result).toEqual(updatedUser);
  });

  it('should call service.remove on remove()', async () => {
    const user = { id: '1' };

    service.remove.mockResolvedValue(user as User);

    const result = await controller.remove('1');

    expect(service.remove).toHaveBeenCalledWith('1');
    expect(result).toEqual(user);
  });
});
