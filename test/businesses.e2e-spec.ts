/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
	INestApplication,
	ValidationPipe,
	VersioningType,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { reach_level } from '@prisma/client';
import { PrismaModule } from 'src/modules/common/prisma/prisma.module';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';
import { BusinessesModule } from 'src/modules/businesses/businesses.module';
import request from 'supertest';

describe('Companies (e2e)', () => {
	let app: INestApplication;
	let prisma: PrismaService;
	const BASE_PATH = '/api/v1/companies';

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
		await prisma.$executeRaw`TRUNCATE TABLE "business" RESTART IDENTITY CASCADE`;
		await prisma.$executeRaw`TRUNCATE TABLE "category" RESTART IDENTITY CASCADE`;
	});

	afterAll(async () => {
		await prisma.$disconnect();
		await app.close();
	});

	it('GET /companies -> deve listar empresas com seus nomes de categorias mapeados', async () => {
		// 1. Criar Categoria
		await prisma.category.create({
			data: { name: 'Alimentação' },
		});

		// 2. Criar Empresa
		await prisma.business.create({
			data: {
				profile_id: 'pousada',
				max_reach_level: reach_level.local,
			},
		});

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const res = await request(app.getHttpServer())
			.get(BASE_PATH)
			.expect(200);

		expect(Array.isArray(res.body)).toBe(true);
		expect(res.body[0].name).toBe('Restaurante Serra');

		// Valida o map() que você fez no Service: [cat.category.name]
		expect(res.body[0].categories).toContain('Alimentação');
		expect(typeof res.body[0].categories[0]).toBe('string');
	});

	it('GET /companies/:id -> deve retornar os detalhes da empresa e categorias', async () => {
		await prisma.category.create({
			data: { name: 'Hotelaria' },
		});
		const business = await prisma.business.create({
			data: {
				profile_id: 'pousada',
				max_reach_level: reach_level.local,
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
