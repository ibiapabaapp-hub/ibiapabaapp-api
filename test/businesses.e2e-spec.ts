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
		// A ordem aqui é importante se não usar CASCADE,
		// mas o TRUNCATE com CASCADE limpa as tabelas N-N automaticamente.
		await prisma.$executeRaw`TRUNCATE TABLE "business_category" RESTART IDENTITY CASCADE`;
		await prisma.$executeRaw`TRUNCATE TABLE "business" RESTART IDENTITY CASCADE`;
		await prisma.$executeRaw`TRUNCATE TABLE "category" RESTART IDENTITY CASCADE`;
		await prisma.$executeRaw`TRUNCATE TABLE "account" RESTART IDENTITY CASCADE`;
	});

	afterAll(async () => {
		await prisma.$disconnect();
		await app.close();
	});

	// Helper function to create a business account
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

	// Helper function to create a business
	const createBusiness = async (accountId: string) => {
		return await prisma.business.create({
			data: {
				account: { connect: { id: accountId } },
				max_reach_level: reach_level.local,
			},
		});
	};

	it('GET /companies -> deve listar empresas com seus nomes de categorias mapeados', async () => {
		// 1. Criar Categoria
		const category = await prisma.category.create({
			data: { name: 'Alimentação' },
		});

		// 2. Criar Account do tipo Business
		const businessAccount = await createBusinessAccount(
			'pousada',
			'Restaurante Serra',
		);

		// 3. Criar Empresa
		const business = await createBusiness(businessAccount.id);

		// 4. Criar relacionamento Business-Category
		await prisma.business_category.create({
			data: {
				business_id: business.id,
				category_id: category.id,
			},
		});

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const res = await request(app.getHttpServer()).get(BASE_PATH).expect(200);

		expect(Array.isArray(res.body)).toBe(true);
		expect(res.body[0].name).toBe('Restaurante Serra');

		// Valida o map() que você fez no Service: [cat.category.name]
		expect(res.body[0].categories).toContain('Alimentação');
		expect(typeof res.body[0].categories[0]).toBe('string');
	});

	it('GET /companies/:id -> deve retornar os detalhes da empresa e categorias', async () => {
		const category = await prisma.category.create({
			data: { name: 'Hotelaria' },
		});

		// Criar Account do tipo Business
		const businessAccount = await createBusinessAccount(
			'pousada-hotel',
			'Hotel Serra',
		);

		const business = await createBusiness(businessAccount.id);

		// Criar relacionamento Business-Category
		await prisma.business_category.create({
			data: {
				business_id: business.id,
				category_id: category.id,
			},
		});

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const res = await request(app.getHttpServer())
			.get(`${BASE_PATH}/${business.id}`)
			.expect(200);

		expect(res.body.id).toBe(business.id);
		expect(res.body.categories).toEqual(['Hotelaria']);
	});
});
