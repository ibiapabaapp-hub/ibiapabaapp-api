import {
	INestApplication,
	ValidationPipe,
	VersioningType,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from 'src/modules/auth/auth.module';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';
import request from 'supertest';
import { App } from 'supertest/types';

import { PrismaModule } from '../src/modules/common/prisma/prisma.module';

describe('Auth (e2e)', () => {
	let app: INestApplication<App>;
	let prisma: PrismaService;
	const BASE_PATH = '/api/v1/auth';

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({ isGlobal: true }),
				PrismaModule,
				AuthModule,
			],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.setGlobalPrefix('/api');
		app.enableVersioning({ type: VersioningType.URI });
		app.useGlobalPipes(
			new ValidationPipe({ whitelist: true, transform: true }),
		);

		prisma = moduleFixture.get<PrismaService>(PrismaService);
		await app.init();
	});

	beforeEach(async () => {
		await prisma.user.deleteMany();
	});

	afterAll(async () => {
		await prisma.$disconnect();
		await app.close();
	});

	const testUser = {
		name: 'Test User',
		username: 'testuser',
		email: 'test@example.com',
		password: 'Password123!',
		password_confirm: 'Password123!',
		birth_date: '1990-01-01T00:00:00.000Z',
		phone_number: '+5585999999999',
		role: 'user',
	};

	describe('POST /register', () => {
		it('should register successfully', async () => {
			return request(app.getHttpServer())
				.post(`${BASE_PATH}/register`)
				.send(testUser)
				.expect(201);
		});
	});

	describe('POST /login', () => {
		it('should login successfully', async () => {
			await request(app.getHttpServer())
				.post(`${BASE_PATH}/register`)
				.send(testUser);

			const res = await request(app.getHttpServer())
				.post(`${BASE_PATH}/login`)
				.send({ email: testUser.email, password: testUser.password })
				.expect(201);

			expect(res.body).toHaveProperty('accessToken');
		});
	});

	describe('GET /check-unique', () => {
		it('should return available false for existing email', async () => {
			await request(app.getHttpServer())
				.post(`${BASE_PATH}/register`)
				.send(testUser);

			const res = await request(app.getHttpServer())
				.get(`${BASE_PATH}/check-unique`)
				.query({ field: 'email', value: testUser.email })
				.expect(200);

			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			expect(res.body.available).toBe(false);
		});
	});

	describe('GET /me', () => {
		it('should return 401 instead of 500 when no token is provided', async () => {
			await request(app.getHttpServer()).get(`${BASE_PATH}/me`).expect(401);
		});
	});
});
