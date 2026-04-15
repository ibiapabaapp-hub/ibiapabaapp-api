import {
	INestApplication,
	ValidationPipe,
	VersioningType,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from 'src/modules/common/jwt/jwt.service';
import { PasswordService } from 'src/modules/common/password/password.service';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';
import { ProfileInterestsService } from 'src/modules/profiles/interests.service';
import { ProfilesController } from 'src/modules/profiles/profiles.controller';
import { ProfilesService } from 'src/modules/profiles/profiles.service';
import request from 'supertest';
import { App } from 'supertest/types';

import { PrismaModule } from '../src/modules/common/prisma/prisma.module';

describe('Profiles (e2e)', () => {
	let app: INestApplication<App>;
	let prisma: PrismaService;
	let passwordService: PasswordService;
	const BASE_PATH = '/api/v1/profiles';

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
			controllers: [ProfilesController],
			providers: [
				ProfilesService,
				ProfileInterestsService,
				PasswordService,
				JwtService,
			],
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

	describe('POST /profiles', () => {
		it('should create a profile for an account', async () => {
			const account = await createMockAccount();

			const res = await request(app.getHttpServer())
				.post(BASE_PATH)
				.send({
					accountId: account.id,
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

			await request(app.getHttpServer()).post(BASE_PATH).send({
				accountId: account.id,
				slug: 'existing-slug',
				display_name: 'First Profile',
				type: 'personal',
			});

			await request(app.getHttpServer())
				.post(BASE_PATH)
				.send({
					accountId: account.id,
					slug: 'existing-slug',
					display_name: 'Second Profile',
					type: 'personal',
				})
				.expect(400);
		});
	});

	describe('GET /profiles', () => {
		it('should return all profiles for an account', async () => {
			const account = await createMockAccount();

			await request(app.getHttpServer()).post(BASE_PATH).send({
				accountId: account.id,
				slug: 'profile-1',
				display_name: 'Profile 1',
				type: 'personal',
			});

			const res = await request(app.getHttpServer())
				.get(BASE_PATH)
				.query({ accountId: account.id })
				.expect(200);

			expect(Array.isArray(res.body)).toBe(true);
			expect(res.body.length).toBe(1);
			expect(res.body[0].slug).toBe('profile-1');
		});
	});

	describe('GET /profiles/:id', () => {
		it('should return a specific profile', async () => {
			const account = await createMockAccount();

			const created = await request(app.getHttpServer()).post(BASE_PATH).send({
				accountId: account.id,
				slug: 'specific-profile',
				display_name: 'Specific Profile',
				type: 'personal',
			});

			const res = await request(app.getHttpServer())
				.get(`${BASE_PATH}/${created.body.id}`)
				.query({ accountId: account.id })
				.expect(200);

			expect(res.body.slug).toBe('specific-profile');
		});
	});

	describe('PATCH /profiles/:id', () => {
		it('should update a profile', async () => {
			const account = await createMockAccount();

			const created = await request(app.getHttpServer()).post(BASE_PATH).send({
				accountId: account.id,
				slug: 'update-profile',
				display_name: 'Update Profile',
				type: 'personal',
			});

			const res = await request(app.getHttpServer())
				.patch(`${BASE_PATH}/${created.body.id}`)
				.send({
					accountId: account.id,
					display_name: 'Updated Name',
				})
				.expect(200);

			expect(res.body.display_name).toBe('Updated Name');
		});
	});

	describe('DELETE /profiles/:id', () => {
		it('should delete a profile', async () => {
			const account = await createMockAccount();

			const created = await request(app.getHttpServer()).post(BASE_PATH).send({
				accountId: account.id,
				slug: 'delete-profile',
				display_name: 'Delete Profile',
				type: 'personal',
			});

			await request(app.getHttpServer())
				.delete(`${BASE_PATH}/${created.body.id}`)
				.query({ accountId: account.id })
				.expect(200);

			const check = await prisma.profile.findUnique({
				where: { id: created.body.id },
			});
			expect(check).toBeNull();
		});
	});
});
