import {
	BadRequestException,
	InternalServerErrorException,
	UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { AccountsService } from 'src/modules/accounts/accounts.service';
import { Account } from 'src/modules/accounts/entities/account.entity';
import { JwtService } from 'src/modules/common/jwt/jwt.service';
import { PasswordService } from 'src/modules/common/password/password.service';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { AuthService } from '../auth.service';
import { RegisterDto } from '../dtos/register.dto';

describe('AuthService', () => {
	let service: AuthService;
	let prisma: DeepMockProxy<PrismaService>;
	let passwordService: DeepMockProxy<PasswordService>;
	let jwtService: DeepMockProxy<JwtService>;
	let usersService: DeepMockProxy<AccountsService>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{ provide: PrismaService, useValue: mockDeep<PrismaService>() },
				{
					provide: PasswordService,
					useValue: mockDeep<PasswordService>(),
				},
				{ provide: JwtService, useValue: mockDeep<JwtService>() },
				{
					provide: AccountsService,
					useValue: mockDeep<AccountsService>(),
				},
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
		prisma = module.get(PrismaService);
		passwordService = module.get(PasswordService);
		jwtService = module.get(JwtService);
		usersService = module.get(AccountsService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('login', () => {
		it('should login successfully', async () => {
			const passwordInDb = 'hashed_password';
			const rawPassword = '123';

			const mockAccount: Account = {
				id: '1',
				email: 'test@test.com',
				password: passwordInDb,
				name: 'Test',
				phone_number: '123',
				active: true,
				// birth_date: new Date(),
				created_at: new Date(),
				updated_at: new Date(),
			};

			usersService.findOneByEmail.mockResolvedValue(mockAccount);
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
			expect(result.account).not.toHaveProperty('password');
			expect(result.accessToken).toBe('token');
			expect(result.refreshToken).toBe('token');
		});

		it('should throw UnauthorizedException if password is invalid', async () => {
			usersService.findOneByEmail.mockResolvedValue({
				id: '1',
				password: 'hashed',
			} as Account);

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
			const mockCreatedAccount = {
				id: '1',
				name: 'John',
			} as Account;

			usersService.create.mockResolvedValue(mockCreatedAccount);
			jwtService.sign.mockReturnValue('token');

			const result = await service.register({
				name: 'John',
				email: 'test@test.com',
				birth_date: new Date(),
				password: '123',
				password_confirm: '123',
			} as RegisterDto);

			expect(result?.account).not.toHaveProperty('password');
			expect(usersService.create).toHaveBeenCalled();
			expect(jwtService.sign).toHaveBeenCalledTimes(2);
			expect(result?.accessToken).toBe('token');
		});
	});

	describe('refreshTokens', () => {
		it('should refresh tokens successfully', async () => {
			jwtService.verify.mockReturnValue({
				id: '1',
			});
			usersService.findOneById.mockResolvedValue({
				id: '1',
			} as Account);
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
		it('should return available true when no account exists', async () => {
			prisma.account.count.mockResolvedValue(0);

			const result = await service.isUniqueAvailable('email', 'test@test.com');

			expect(prisma.account.count).toHaveBeenCalledWith({
				where: { email: 'test@test.com' },
			});

			expect(result).toEqual({
				field: 'email',
				value: 'test@test.com',
				available: true,
			});
		});

		it('should return available false when account already exists', async () => {
			prisma.account.count.mockResolvedValue(1);

			const result = await service.isUniqueAvailable('email', 'test@test.com');

			expect(prisma.account.count).toHaveBeenCalledWith({
				where: { email: 'test@test.com' },
			});

			expect(result).toEqual({
				field: 'email',
				value: 'test@test.com',
				available: false,
			});
		});

		it('should throw InternalServerErrorException on prisma error', async () => {
			prisma.account.count.mockRejectedValue(new Error('DB error'));

			await expect(
				service.isUniqueAvailable('email', 'test@test.com'),
			).rejects.toThrow(InternalServerErrorException);
		});
	});
});
