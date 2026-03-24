import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';
import { PasswordService } from 'src/modules/common/password/password.service';
import { JwtService } from 'src/modules/common/jwt/jwt.service';
import { UsersService } from 'src/modules/users/users.service';
import {
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { user_role } from '@prisma/client';
import { User } from 'src/modules/users/entities/user.entity';
import { RegisterDto } from './dtos/register.dto';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: DeepMockProxy<PrismaService>;
  let passwordService: DeepMockProxy<PasswordService>;
  let jwtService: DeepMockProxy<JwtService>;
  let usersService: DeepMockProxy<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
        { provide: PasswordService, useValue: mockDeep<PasswordService>() },
        { provide: JwtService, useValue: mockDeep<JwtService>() },
        { provide: UsersService, useValue: mockDeep<UsersService>() },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    passwordService = module.get(PasswordService);
    jwtService = module.get(JwtService);
    usersService = module.get(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const passwordInDb = 'hashed_password';
      const rawPassword = '123';

      const mockUser: User = {
        id: '1',
        email: 'test@test.com',
        password: passwordInDb,
        role: user_role.superuser,
        name: 'Test',
        username: 'test',
        phone_number: '123',
        active: true,
        birth_date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      usersService.findOneByEmail.mockResolvedValue(mockUser);
      passwordService.verifyPassword.mockResolvedValue(true);
      jwtService.sign.mockReturnValue('token');

      const result = await service.login({
        email: 'test@test.com',
        password: rawPassword,
      });

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        'test@test.com',
        true,
      );
      expect(passwordService.verifyPassword).toHaveBeenCalledWith(
        passwordInDb,
        rawPassword,
      );
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(result.user).not.toHaveProperty('password');
      expect(result.accessToken).toBe('token');
      expect(result.refreshToken).toBe('token');
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      usersService.findOneByEmail.mockResolvedValue({
        id: '1',
        password: 'hashed',
      } as User);

      passwordService.verifyPassword.mockResolvedValue(false);

      await expect(
        service.login({ email: 'a', password: 'b' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should throw BadRequestException if passwords do not match', async () => {
      await expect(
        service.register({
          password: '123',
          password_confirm: '456',
        } as RegisterDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should register a user successfully', async () => {
      const mockCreatedUser = {
        id: '1',
        role: user_role.superuser,
        name: 'John',
      } as User;

      usersService.create.mockResolvedValue(mockCreatedUser);
      jwtService.sign.mockReturnValue('token');

      const result = await service.register({
        name: 'John',
        username: 'john_doe',
        email: 'test@test.com',
        birth_date: new Date(),
        role: user_role.superuser,
        password: '123',
        password_confirm: '123',
      } as RegisterDto);

      expect(result?.user).not.toHaveProperty('password');
      expect(usersService.create).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(result?.accessToken).toBe('token');
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      jwtService.verify.mockReturnValue({ id: '1', role: user_role.superuser });
      usersService.findOneById.mockResolvedValue({
        id: '1',
        role: user_role.superuser,
      } as User);
      jwtService.sign.mockReturnValue('token');

      const result = await service.refreshTokens('refresh');

      expect(jwtService.verify).toHaveBeenCalledWith('refresh');
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(result.accessToken).toBe('token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jwtService.verify.mockReturnValue({ id: '1', role: 1 });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      usersService.findOneByEmail.mockResolvedValue(null as any);

      await expect(service.refreshTokens('refresh')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('isUniqueAvailable', () => {
    it('should return available true when no user exists', async () => {
      prisma.user.count.mockResolvedValue(0);

      const result = await service.isUniqueAvailable('email', 'test@test.com');

      expect(prisma.user.count).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });

      expect(result).toEqual({
        field: 'email',
        value: 'test@test.com',
        available: true,
      });
    });

    it('should return available false when user already exists', async () => {
      prisma.user.count.mockResolvedValue(1);

      const result = await service.isUniqueAvailable('username', 'john');

      expect(prisma.user.count).toHaveBeenCalledWith({
        where: { username: 'john' },
      });

      expect(result).toEqual({
        field: 'username',
        value: 'john',
        available: false,
      });
    });

    it('should throw InternalServerErrorException on prisma error', async () => {
      prisma.user.count.mockRejectedValue(new Error('DB error'));

      await expect(
        service.isUniqueAvailable('email', 'test@test.com'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
