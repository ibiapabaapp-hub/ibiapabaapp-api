import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { InterestsService } from './interests.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { user_role } from '@prisma/client';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './entities/user.entity';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: DeepMockProxy<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockDeep<UsersService>(),
        },
        InterestsService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<DeepMockProxy<UsersService>>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call usersService.findAll on findAll()', async () => {
    const pagination = { limit: 10, offset: 0 };
    const users = [{ id: '1' }];

    usersService.findAll.mockResolvedValue(users as User[]);

    const result = await controller.findAll(pagination);

    expect(usersService.findAll).toHaveBeenCalledWith(pagination);
    expect(result).toEqual(users);
  });

  it('should call usersService.findOneById on findOneById()', async () => {
    const user = { id: '1' };

    usersService.findOneById.mockResolvedValue(user as User);

    const result = await controller.findOneById('1');

    expect(usersService.findOneById).toHaveBeenCalledWith('1');
    expect(result).toEqual(user);
  });

  it('should call usersService.update on update()', async () => {
    const dto = {
      name: 'Updated',
      password: '123456',
      role: user_role.superuser,
    };

    const updatedUser = {
      id: '1',
      name: 'Updated',
      role: user_role.superuser,
    };

    usersService.update.mockResolvedValue(updatedUser as User);

    const result = await controller.update('1', dto as UpdateUserDto);

    expect(usersService.update).toHaveBeenCalledWith('1', dto);
    expect(result).toEqual(updatedUser);
  });

  it('should call usersService.remove on remove()', async () => {
    const user = { id: '1' };

    usersService.remove.mockResolvedValue(user as User);

    const result = await controller.remove('1');

    expect(usersService.remove).toHaveBeenCalledWith('1');
    expect(result).toEqual(user);
  });
});
