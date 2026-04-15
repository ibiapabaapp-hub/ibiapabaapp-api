import {
	INestApplication,
	ValidationPipe,
	VersioningType,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from 'src/modules/accounts/accounts.controller';
import { AccountsService } from 'src/modules/accounts/accounts.service';
import { JwtService } from 'src/modules/common/jwt/jwt.service';
import { PasswordService } from 'src/modules/common/password/password.service';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';
import { ProfilesModule } from 'src/modules/profiles/profiles.module';
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
			imports: [
				ConfigModule.forRoot({ isGlobal: true }),
				PrismaModule,
				ProfilesModule,
			],
			controllers: [AccountsController],
			providers: [AccountsService, PasswordService, JwtService],
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
		await prisma.account_profile.deleteMany();
		await prisma.profile.deleteMany();
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

	describe('POST /accounts/:accountId/profiles', () => {
		it('should create a profile for an account', async () => {
			const account = await createMockAccount();

			const res = await request(app.getHttpServer())
				.post(`${BASE_PATH}/${account.id}/profiles`)
				.send({
					slug: 'test-profile',
					display_name: 'Test Profile',
					type: 'personal',
				})
				.expect(201);

			expect(res.body.slug).toBe('test-profile');
			expect(res.body.display_name).toBe('Test Profile');
			expect(res.body.type).toBe('personal');
		});

		it('should return 400 if slug already exists', async () => {
			const account = await createMockAccount();

			await request(app.getHttpServer())
				.post(`${BASE_PATH}/${account.id}/profiles`)
				.send({
					slug: 'existing-slug',
					display_name: 'First Profile',
					type: 'personal',
				});

			await request(app.getHttpServer())
				.post(`${BASE_PATH}/${account.id}/profiles`)
				.send({
					slug: 'existing-slug',
					display_name: 'Second Profile',
					type: 'personal',
				})
				.expect(400);
		});
	});

	describe('GET /accounts/:accountId/profiles', () => {
		it('should return all profiles for an account', async () => {
			const account = await createMockAccount();

			await request(app.getHttpServer())
				.post(`${BASE_PATH}/${account.id}/profiles`)
				.send({
					slug: 'profile-1',
					display_name: 'Profile 1',
					type: 'personal',
				});

			const res = await request(app.getHttpServer())
				.get(`${BASE_PATH}/${account.id}/profiles`)
				.expect(200);

			expect(Array.isArray(res.body)).toBe(true);
			expect(res.body.length).toBe(1);
			expect(res.body[0].slug).toBe('profile-1');
		});
	});

	describe('GET /accounts/:accountId/profiles/:id', () => {
		it('should return a specific profile', async () => {
			const account = await createMockAccount();

			const created = await request(app.getHttpServer())
				.post(`${BASE_PATH}/${account.id}/profiles`)
				.send({
					slug: 'specific-profile',
					display_name: 'Specific Profile',
					type: 'personal',
				});

			const res = await request(app.getHttpServer())
				.get(`${BASE_PATH}/${account.id}/profiles/${created.body.id}`)
				.expect(200);

			expect(res.body.slug).toBe('specific-profile');
		});
	});
});
