import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PasswordService } from 'src/common/password/password.service';
import {
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { UserRole, users } from '@prisma/client';
import { User } from './entities/user.entity';
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
      prisma.user.findMany.mockResolvedValue(users as users[]);

      const result = await service.findAll({ limit: 10, offset: 0 });

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        omit: { password: true },
      });
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const user = { id: '1' };
      prisma.user.findFirst.mockResolvedValue(user as User);

      const result = await service.findOne('1');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: '1' },
        omit: { password: true },
      });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
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
        role: UserRole.superuser,
      };

      prisma.user.findUnique.mockResolvedValue(existingUser as User);
      passwordService.verifyPassword.mockResolvedValue(true);
      passwordService.hashPassword.mockResolvedValue('new-hash');
      prisma.user.update.mockResolvedValue(updatedUser as User);

      const result = await service.update('1', {
        name: 'Updated',
        password: '123456',
        role: UserRole.superuser,
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
      } as User);

      passwordService.verifyPassword.mockResolvedValue(false);

      await expect(
        service.update('1', { password: 'wrong' } as User),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.update('1', { password: '123' } as User),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if password is missing in DTO', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1' } as User);

      await expect(
        service.update('1', { name: 'New Name' } as User),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a user if it exists', async () => {
      const user = { id: '1' };

      prisma.user.findFirst.mockResolvedValue(user as User);
      prisma.user.delete.mockResolvedValue(user as User);

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
      prisma.user.findFirst.mockResolvedValue({ id: '1' } as User);
      prisma.user.delete.mockRejectedValue(
        new InternalServerErrorException('Delete failed'),
      );

      await expect(service.remove('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
