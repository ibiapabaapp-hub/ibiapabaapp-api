import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';
import { PasswordService } from 'src/modules/common/password/password.service';
import {
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { user as UserPrisma } from '@prisma/client';
import { User as UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dtos/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: DeepMockProxy<PrismaService>;
  let passwordService: DeepMockProxy<PasswordService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: PasswordService,
          useValue: mockDeep<PasswordService>(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get(PrismaService);
    passwordService = module.get(PasswordService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return users with pagination', async () => {
      const users = [{ id: '1' }];
      prisma.user.findMany.mockResolvedValue(users as UserPrisma[]);

      const result = await service.findAll({ limit: 10, offset: 0 });

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        omit: { password: true },
      });
      expect(result).toEqual(users);
    });
  });

  describe('findOneById', () => {
    it('should return a user if found', async () => {
      const user = { id: '1' };
      prisma.user.findFirst.mockResolvedValue(user as UserEntity);

      const result = await service.findOneById('1');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: '1' },
        omit: { password: true },
      });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.findOneById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneByEmail', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: 'hashed-password',
      name: 'Test User',
    };

    it('should return a user without password by default', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = mockUser;
      prisma.user.findFirst.mockResolvedValue(
        userWithoutPassword as UserPrisma,
      );

      const result = await service.findOneByEmail('test@example.com');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        omit: { password: true },
      });
      expect(result).not.toHaveProperty('password');
      expect(result).toEqual(userWithoutPassword);
    });

    it('should return a user with password when getPassword is true', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser as UserPrisma);

      const result = await service.findOneByEmail('test@example.com', true);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        omit: { password: false },
      });
      expect(result).toHaveProperty('password');
      expect(result.password).toBe('hashed-password');
    });

    it('should throw NotFoundException if user email is not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.findOneByEmail('nonexistent@example.com'),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.user.findFirst).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a user when credentials are valid', async () => {
      const existingUser = {
        id: '1',
        password: 'hashed-password',
      };

      const updatedUser = {
        id: '1',
        name: 'Updated',
        role: 'superuser',
      };

      prisma.user.findUnique.mockResolvedValue(existingUser as UserEntity);
      passwordService.verifyPassword.mockResolvedValue(true);
      passwordService.hashPassword.mockResolvedValue('new-hash');
      prisma.user.update.mockResolvedValue(updatedUser as UserEntity);

      const result = await service.update('1', {
        name: 'Updated',
        password: '123456',
        role: 'superuser',
      } as UpdateUserDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(passwordService.verifyPassword).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalled();
      expect(result).toEqual(updatedUser);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        password: 'hashed',
      } as UserEntity);

      passwordService.verifyPassword.mockResolvedValue(false);

      await expect(
        service.update('1', { password: 'wrong' } as UserEntity),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.update('1', { password: '123' } as UserEntity),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if password is missing in DTO', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1' } as UserEntity);

      await expect(
        service.update('1', { name: 'New Name' } as UserEntity),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a user if it exists', async () => {
      const user = { id: '1' };

      prisma.user.findFirst.mockResolvedValue(user as UserEntity);
      prisma.user.delete.mockResolvedValue(user as UserEntity);

      const result = await service.remove('1');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: '1' },
        omit: { password: true },
      });
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on database failure', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: '1' } as UserEntity);
      prisma.user.delete.mockRejectedValue(
        new InternalServerErrorException('Delete failed'),
      );

      await expect(service.remove('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
