import {
	INestApplication,
	ValidationPipe,
	VersioningType,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CitiesModule } from 'src/modules/cities/cities.module';
import { City } from 'src/modules/cities/entities/city.entity';
import { PrismaModule } from 'src/modules/common/prisma/prisma.module';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';
import { MediasModule } from 'src/modules/medias/medias.module';
import request from 'supertest';
import { App } from 'supertest/types';

interface CityWithLocation extends City {
	location?: { type: string; coordinates: number[] };
}

describe('Cities (e2e)', () => {
	let app: INestApplication<App>;
	let prisma: PrismaService;
	const BASE_PATH = '/api/v1/cities';

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({ isGlobal: true }),
				PrismaModule,
				CitiesModule,
				MediasModule,
			],
		}).compile();

		app = moduleFixture.createNestApplication();

		app.setGlobalPrefix('/api');
		app.enableVersioning({ type: VersioningType.URI });

		prisma = moduleFixture.get<PrismaService>(PrismaService);

		app.useGlobalPipes(
			new ValidationPipe({ whitelist: true, transform: true }),
		);

		await app.init();
		await prisma.$executeRaw`TRUNCATE TABLE "city" RESTART IDENTITY CASCADE`;
	});

	afterEach(async () => {
		await prisma.$executeRaw`TRUNCATE TABLE "city" RESTART IDENTITY CASCADE`;
	});

	afterAll(async () => {
		await prisma.$disconnect();
		await app.close();
	});

	it('GET /cities -> lists all cities with geography data', async () => {
		await prisma.$executeRaw`
      INSERT INTO "city" (id, name, slug, description, location, created_at, updated_at) 
      VALUES (
        gen_random_uuid(), 
        'Tianguá', 
        'tiangua', 
        'Serra da Ibiapaba', 
        ST_SetSRID(ST_MakePoint(-40.9916, -3.7323), 4326),
        NOW(),
        NOW()
      )
    `;

		const res = await request(app.getHttpServer()).get(BASE_PATH).expect(200);

		const body = res.body as CityWithLocation[];
		expect(Array.isArray(body)).toBe(true);
		expect(body.length).toBe(1);
		expect(body[0].name).toBe('Tianguá');
		expect(body[0].slug).toBe('tiangua');

		expect(body[0].location).toHaveProperty('type', 'Point');
		expect(body[0].location).toHaveProperty('coordinates');
	});

	it('GET /cities/:id -> returns 404 if city not found', async () => {
		const fakeUuid = '00000000-0000-0000-0000-000000000000';
		await request(app.getHttpServer())
			.get(`${BASE_PATH}/${fakeUuid}`)
			.expect(404);
	});

	it('GET /cities/:id -> returns one city by id', async () => {
		const cityId = '550e8400-e29b-41d4-a716-446655440000';

		await prisma.$executeRaw`
      INSERT INTO "city" (id, name, slug, description, location, created_at, updated_at) 
      VALUES (
        ${cityId}::uuid, 
        'Ubajara', 
        'ubajara', 
        'Parque Nacional', 
        ST_SetSRID(ST_MakePoint(-40.91, -3.83), 4326),
        NOW(),
        NOW()
      )
    `;

		const res = await request(app.getHttpServer())
			.get(`${BASE_PATH}/${cityId}`)
			.expect(200);

		const body = res.body as City;
		expect(body.id).toBe(cityId);
		expect(body.name).toBe('Ubajara');
	});

	it('GET /cities/:id/media -> returns city media list', async () => {
		const cityId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

		await prisma.$executeRaw`
      INSERT INTO "city" (id, name, slug, description, location, created_at, updated_at) 
      VALUES (${cityId}::uuid, 'Viçosa', 'vicosa', 'Desc', ST_SetSRID(ST_MakePoint(0,0), 4326), NOW(), NOW())
    `;

		const res = await request(app.getHttpServer())
			.get(`${BASE_PATH}/${cityId}/media`)
			.expect(200);

		expect(Array.isArray(res.body)).toBe(true);
	});
});
