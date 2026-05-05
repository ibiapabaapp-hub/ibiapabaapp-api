import {
	INestApplication,
	ValidationPipe,
	VersioningType,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from 'src/modules/accounts/accounts.controller';
import { AccountsService } from 'src/modules/accounts/accounts.service';
import { AccountInterestsService } from 'src/modules/accounts/account-interests.service';
import { JwtService } from 'src/modules/common/jwt/jwt.service';
import { PasswordService } from 'src/modules/common/password/password.service';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';
import request from 'supertest';
import { App } from 'supertest/types';

import { PrismaModule } from '../src/modules/common/prisma/prisma.module';

describe('Accounts (e2e)', () => {
	let app: INestApplication<App>;
	let prisma: PrismaService;
	let passwordService: PasswordService;
	const BASE_PATH = '/api/v1/accounts';

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
			controllers: [AccountsController],
			providers: [AccountsService, AccountInterestsService, PasswordService, JwtService],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.setGlobalPrefix('/api');
		app.enableVersioning({ type: VersioningType.URI });
		app.useGlobalPipes(
			new ValidationPipe({ whitelist: true, transform: true }),
		);

		prisma = moduleFixture.get<PrismaService>(PrismaService);
		passwordService = moduleFixture.get<PasswordService>(PasswordService);

		await app.init();
	});

	beforeEach(async () => {
		await prisma.account.deleteMany();
		await prisma.account.deleteMany();
		await prisma.account.deleteMany();
	});

	afterAll(async () => {
		await prisma.$disconnect();
		await app.close();
	});

	const createMockAccount = async (
		email = `account_${Math.random()}@test.com`,
		phoneNumber?: string,
	) => {
		return prisma.account.create({
			data: {
				email,
				password: await passwordService.hashPassword('password123'),
				phone_number:
					phoneNumber ||
					`+55859${Math.floor(Math.random() * 90000000 + 10000000)}`,
				name: 'Test Account',
				slug: `test-account-${Math.random()}`,
				display_name: 'Test Account',
				active: true,
			},
		});
	};

	describe('GET /accounts', () => {
		it('should return a list of accounts without passwords', async () => {
			await createMockAccount();
			const res = await request(app.getHttpServer()).get(BASE_PATH).expect(200);

			expect(Array.isArray(res.body)).toBe(true);
			expect(res.body.length).toBeGreaterThan(0);

			res.body.forEach((account: any) => {
				expect(account.password).toBeUndefined();
				expect(account).not.toHaveProperty('password');
			});
		});
	});

	describe('GET /accounts/:id', () => {
		it('should return a single account without password', async () => {
			const account = await createMockAccount();
			const res = await request(app.getHttpServer())
				.get(`${BASE_PATH}/${account.id}`)
				.expect(200);

			expect(res.body.id).toBe(account.id);
			expect(res.body.password).toBeUndefined();
			expect(res.body).not.toHaveProperty('password');
		});

		it('should return 404 for non-existing account', async () => {
			const fakeId = '00000000-0000-0000-0000-000000000000';
			await request(app.getHttpServer())
				.get(`${BASE_PATH}/${fakeId}`)
				.expect(404);
		});
	});

	describe('PATCH /accounts/:id', () => {
		it('should update account successfully and not return password', async () => {
			const account = await createMockAccount('update@test.com');

			const res = await request(app.getHttpServer())
				.patch(`${BASE_PATH}/${account.id}`)
				.send({
					name: 'Novo Nome',
					password: 'password123',
				})
				.expect(200);

			expect(res.body.name).toBe('Novo Nome');
			expect(res.body.password).toBeUndefined();
			expect(res.body).not.toHaveProperty('password');
		});

		it('should return 401 if current password is wrong', async () => {
			const account = await createMockAccount('auth-fail@test.com');

			await request(app.getHttpServer())
				.patch(`${BASE_PATH}/${account.id}`)
				.send({
					name: 'Fail',
					password: 'wrong_password',
				})
				.expect(401);
		});
	});

	describe('DELETE /accounts/:id', () => {
		it('should remove an account and return deleted account data without password', async () => {
			const account = await createMockAccount();
			const res = await request(app.getHttpServer())
				.delete(`${BASE_PATH}/${account.id}`)
				.expect(200);

			expect(res.body.password).toBeUndefined();

			const check = await prisma.account.findUnique({
				where: { id: account.id },
			});
			expect(check).toBeNull();
		});
	});
});
