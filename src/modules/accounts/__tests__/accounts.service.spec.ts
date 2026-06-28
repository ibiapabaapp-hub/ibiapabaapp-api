import {
	BadRequestException,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { account } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { AccountsService } from '../accounts.service';
import { UpdateAccountDTO } from '../dtos/update-account.dto';

jest.mock('src/modules/common/password/password.util', () => ({
	hashPassword: jest.fn().mockResolvedValue('hashed-password'),
}));

import { hashPassword } from 'src/modules/common/password/password.util';

describe('AccountsService', () => {
	let service: AccountsService;
	let prisma: DeepMockProxy<PrismaService>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AccountsService,
				{
					provide: PrismaService,
					useValue: mockDeep<PrismaService>(),
				},
			],
		}).compile();

		service = module.get<AccountsService>(AccountsService);
		prisma = module.get(PrismaService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('findAll', () => {
		it('should return accounts with pagination', async () => {
			const accounts = [{ id: '1' }];
			prisma.account.findMany.mockResolvedValue(accounts as account[]);

			const result = await service.findAll({ limit: 10, offset: 0 });

			expect(prisma.account.findMany).toHaveBeenCalledWith({
				take: 10,
				skip: 0,
				omit: { password: true },
			});
			expect(result).toEqual(accounts);
		});
	});

	describe('findOneById', () => {
		it('should return a account if found', async () => {
			const account = { id: '1' };
			prisma.account.findFirst.mockResolvedValue(account as account);

			const result = await service.findOneById('1');

			expect(prisma.account.findFirst).toHaveBeenCalledWith({
				where: { id: '1' },
				omit: { password: true },
			});
			expect(result).toEqual(account);
		});

		it('should throw NotFoundException if account does not exist', async () => {
			prisma.account.findFirst.mockResolvedValue(null);

			await expect(service.findOneById('1')).rejects.toThrow(NotFoundException);
		});
	});

	describe('findOneByEmail', () => {
		const mock = {
			id: '1',
			email: 'test@example.com',
			password: 'hashed-password',
			name: 'Test ',
		};

		it('should return a account without password by default', async () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password, ...accountWithoutPassword } = mock;
			prisma.account.findFirst.mockResolvedValue(
				accountWithoutPassword as account,
			);

			const result = await service.findOneByEmail('test@example.com');

			expect(prisma.account.findFirst).toHaveBeenCalledWith({
				where: { email: 'test@example.com' },
				omit: { password: true },
			});
			expect(result).not.toHaveProperty('password');
			expect(result).toEqual(accountWithoutPassword);
		});

		it('should return a account with password when getPassword is true', async () => {
			prisma.account.findFirst.mockResolvedValue(mock as account);

			const result = await service.findOneByEmail('test@example.com', true);

			expect(prisma.account.findFirst).toHaveBeenCalledWith({
				where: { email: 'test@example.com' },
				omit: { password: false },
			});
			expect(result).toHaveProperty('password');
			expect(result.password).toBe('hashed-password');
		});

		it('should throw NotFoundException if account email is not found', async () => {
			prisma.account.findFirst.mockResolvedValue(null);

			await expect(
				service.findOneByEmail('nonexistent@example.com'),
			).rejects.toThrow(NotFoundException);

			expect(prisma.account.findFirst).toHaveBeenCalled();
		});
	});

	describe('update', () => {
		it('should update a account when credentials are valid', async () => {
			const existing = {
				id: '1',
				password: 'hashed-password',
			};

			const updated: Account = {
				id: '1',
				email: 'test@example.com',
				phone_number: '123456789',
				password: 'new-hash',
				name: 'Updated',
				active: true,
				created_at: new Date(),
				updated_at: new Date(),
				is_verified: false,
				slug: '',
				display_name: '',
				bio: null,
				avatar_url: null,
				type: 'business',
			};

			prisma.account.findUnique.mockResolvedValue(existing as account);
			(hashPassword as jest.Mock).mockResolvedValue('new-hash');
			prisma.account.update.mockResolvedValue(updated as account);

			const result = await service.update('1', {
				name: 'Updated',
				password: '123456',
				role: 'superaccount',
			} as UpdateAccountDTO);

			expect(prisma.account.findUnique).toHaveBeenCalledWith({
				where: { id: '1' },
			});
			expect(hashPassword).toHaveBeenCalled();
			expect(prisma.account.update).toHaveBeenCalled();
			expect(result).toEqual(updated);
		});

		it('should throw NotFoundException if account does not exist', async () => {
			prisma.account.findUnique.mockResolvedValue(null);

			await expect(
				service.update('1', { password: '123' } as UpdateAccountDTO),
			).rejects.toThrow(NotFoundException);
		});

		it('should throw BadRequestException if password is missing in DTO', async () => {
			prisma.account.findUnique.mockResolvedValue({ id: '1' } as account);

			await expect(
				service.update('1', { name: 'New Name' } as UpdateAccountDTO),
			).rejects.toThrow(BadRequestException);
		});
	});

	describe('remove', () => {
		it('should delete a account if it exists', async () => {
			const account = { id: '1' };

			prisma.account.findFirst.mockResolvedValue(account as account);
			prisma.account.delete.mockResolvedValue(account as account);

			const result = await service.remove('1');

			expect(prisma.account.findFirst).toHaveBeenCalledWith({
				where: { id: '1' },
				omit: { password: true },
			});
			expect(prisma.account.delete).toHaveBeenCalledWith({
				where: { id: '1' },
			});
			expect(result).toEqual(account);
		});

		it('should throw NotFoundException if account does not exist', async () => {
			prisma.account.findFirst.mockResolvedValue(null);

			await expect(service.remove('1')).rejects.toThrow(NotFoundException);
		});

		it('should throw InternalServerErrorException on database failure', async () => {
			prisma.account.findFirst.mockResolvedValue({ id: '1' } as account);
			prisma.account.delete.mockRejectedValue(
				new InternalServerErrorException('Delete failed'),
			);

			await expect(service.remove('1')).rejects.toThrow(
				InternalServerErrorException,
			);
		});
	});
});
