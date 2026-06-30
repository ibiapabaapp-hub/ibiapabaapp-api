/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
	INestApplication,
	ValidationPipe,
	VersioningType,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { reach_level } from '@prisma/client';
import { BusinessesModule } from 'src/modules/businesses/businesses.module';
import { hashPassword } from 'src/modules/common/password/password.util';
import { PrismaModule } from 'src/modules/common/prisma/prisma.module';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';
import request from 'supertest';

describe('Companies (e2e)', () => {
	let app: INestApplication;
	let prisma: PrismaService;
	const BASE_PATH = '/api/v1/businesses';

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({ isGlobal: true }),
				PrismaModule,
				BusinessesModule,
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

	afterEach(async () => {
		await prisma.$executeRaw`TRUNCATE TABLE "business_tag" RESTART IDENTITY CASCADE`;
		await prisma.$executeRaw`TRUNCATE TABLE "business" RESTART IDENTITY CASCADE`;
		await prisma.$executeRaw`TRUNCATE TABLE "tag" RESTART IDENTITY CASCADE`;
		await prisma.$executeRaw`TRUNCATE TABLE "tag_group" RESTART IDENTITY CASCADE`;
		await prisma.$executeRaw`TRUNCATE TABLE "account" RESTART IDENTITY CASCADE`;
	});

	afterAll(async () => {
		await prisma.$disconnect();
		await app.close();
	});

	const createBusinessAccount = async (slug: string, name: string) => {
		return await prisma.account.create({
			data: {
				id: crypto.randomUUID(),
				email: `business-${slug}@test.com`,
				password: await hashPassword('password123'),
				phone_number: `+5588${Math.floor(Math.random() * 100000000)
					.toString()
					.padStart(8, '0')}`,
				name,
				slug,
				display_name: name,
				type: 'business',
				is_verified: true,
				active: true,
			},
		});
	};

	const createBusiness = async (accountId: string) => {
		return await prisma.business.create({
			data: {
				account: { connect: { id: accountId } },
				max_reach_level: reach_level.local,
			},
		});
	};

	it('GET /businesses -> deve listar empresas com seus nomes de tags mapeados', async () => {
		const group = await prisma.tag_group.create({
			data: { name: 'Categorias' },
		});

		const tag = await prisma.tag.create({
			data: { name: 'Alimentação', slug: 'alimentacao', group_id: group.id },
		});

		const businessAccount = await createBusinessAccount(
			'pousada',
			'Restaurante Serra',
		);

		const business = await createBusiness(businessAccount.id);

		await prisma.business_tag.create({
			data: {
				business_id: business.id,
				tag_id: tag.id,
			},
		});

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const res = await request(app.getHttpServer()).get(BASE_PATH).expect(200);

		expect(Array.isArray(res.body)).toBe(true);
		expect(res.body[0].name).toBe('Restaurante Serra');
		expect(res.body[0].tags).toContain('Alimentação');
		expect(typeof res.body[0].tags[0]).toBe('string');
	});

	it('GET /businesses/:id -> deve retornar os detalhes da empresa e tags', async () => {
		const group = await prisma.tag_group.create({
			data: { name: 'Categorias' },
		});

		const tag = await prisma.tag.create({
			data: { name: 'Hotelaria', slug: 'hotelaria', group_id: group.id },
		});

		const businessAccount = await createBusinessAccount(
			'pousada-hotel',
			'Hotel Serra',
		);

		const business = await createBusiness(businessAccount.id);

		await prisma.business_tag.create({
			data: {
				business_id: business.id,
				tag_id: tag.id,
			},
		});

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const res = await request(app.getHttpServer())
			.get(`${BASE_PATH}/${business.id}`)
			.expect(200);

		expect(res.body.id).toBe(business.id);
		expect(res.body.tags).toEqual(['Hotelaria']);
	});
});
