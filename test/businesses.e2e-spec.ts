/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
	INestApplication,
	ValidationPipe,
	VersioningType,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { reach_level } from '@prisma/client';
import { BusinessesModule } from 'src/modules/businesses/businesses.module';
import { AuthGuard } from 'src/modules/common/guards/auth.guard';
import { JwtModule } from 'src/modules/common/jwt/jwt.module';
import { JwtService } from 'src/modules/common/jwt/jwt.service';
import { hashPassword } from 'src/modules/common/password/password.util';
import { PrismaModule } from 'src/modules/common/prisma/prisma.module';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';
import request from 'supertest';

describe('Companies (e2e)', () => {
	let app: INestApplication;
	let prisma: PrismaService;
	let moduleFixtureJwt: JwtService;
	const BASE_PATH = '/api/v1/businesses';

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({ isGlobal: true }),
				PrismaModule,
				JwtModule,
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
		moduleFixtureJwt = moduleFixture.get<JwtService>(JwtService);
		app.useGlobalGuards(new AuthGuard(app.get(Reflector), app.get(JwtService)));
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

	const createCity = async (id: string, name: string) => {
		await prisma.$executeRaw`
			INSERT INTO "city" (id, name, slug, location, created_at, updated_at)
			VALUES (${id}::uuid, ${name}, ${name.toLowerCase()}, ST_SetSRID(ST_MakePoint(0, 0), 4326), NOW(), NOW())
		`;
	};

	const tokenFor = (accountId: string) =>
		moduleFixtureJwt.sign({ id: accountId, role: 'user' });

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
			.set('Authorization', `Bearer ${tokenFor(businessAccount.id)}`)
			.expect(200);

		expect(res.body.id).toBe(business.id);
		expect(res.body.tags).toEqual(['Hotelaria']);
	});

	it('POST /businesses/onboarding -> cria empresa, matriz e filiais', async () => {
		const account = await createBusinessAccount('onboarding', 'Conta inicial');
		const headquarters = crypto.randomUUID();
		const branch = crypto.randomUUID();
		await createCity(headquarters, 'Tiangua');
		await createCity(branch, 'Ubajara');

		const res = await request(app.getHttpServer())
			.post(`${BASE_PATH}/onboarding`)
			.set('Authorization', `Bearer ${tokenFor(account.id)}`)
			.send({
				name: 'Empresa Onboarding',
				cnpj: '12.345.678/0001-95',
				headquarters_city_id: headquarters,
				branch_city_ids: [branch, headquarters],
			})
			.expect(201);

		expect(res.body.name).toBe('Empresa Onboarding');
		expect(res.body.headquarters_city.id).toBe(headquarters);
		expect(res.body.branch_cities).toHaveLength(1);
		expect(
			await prisma.business_city.count({ where: { business_id: res.body.id } }),
		).toBe(2);
		expect(
			(await prisma.account.findUnique({ where: { id: account.id } }))
				?.display_name,
		).toBe('Empresa Onboarding');
	});

	it('POST /businesses/onboarding -> rejeita CNPJ inválido e cidade inexistente', async () => {
		const account = await createBusinessAccount('validation', 'Conta inicial');
		const cityId = crypto.randomUUID();
		await createCity(cityId, 'Ibiapina');
		const auth = { Authorization: `Bearer ${tokenFor(account.id)}` };

		await request(app.getHttpServer())
			.post(`${BASE_PATH}/onboarding`)
			.set(auth)
			.send({
				name: 'Empresa',
				cnpj: '11111111111111',
				headquarters_city_id: cityId,
			})
			.expect(400);

		await request(app.getHttpServer())
			.post(`${BASE_PATH}/onboarding`)
			.set(auth)
			.send({
				name: 'Empresa',
				cnpj: '12345678000195',
				headquarters_city_id: crypto.randomUUID(),
			})
			.expect(404);
	});
});
