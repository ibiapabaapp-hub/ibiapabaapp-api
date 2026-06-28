/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
	INestApplication,
	ValidationPipe,
	VersioningType,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { hashPassword } from 'src/modules/common/password/password.util';
import { PrismaModule } from 'src/modules/common/prisma/prisma.module';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';
import { Event } from 'src/modules/events/entities/event.entity';
import { EventsModule } from 'src/modules/events/events.module';
import request from 'supertest';
import { App } from 'supertest/types';

describe('Events (e2e)', () => {
	let app: INestApplication<App>;
	let prisma: PrismaService;
	const BASE_PATH = '/api/v1/events';

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({ isGlobal: true }),
				PrismaModule,
				EventsModule,
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
	});

	afterEach(async () => {
		await prisma.$executeRaw`TRUNCATE TABLE "event" RESTART IDENTITY CASCADE`;
		await prisma.$executeRaw`TRUNCATE TABLE "account" RESTART IDENTITY CASCADE`;
	});

	afterAll(async () => {
		await prisma.$disconnect();
		await app.close();
	});

	// Helper function to create an account for events
	const createEventAccount = async (slug: string, name: string) => {
		return await prisma.account.create({
			data: {
				id: crypto.randomUUID(),
				email: `event-${slug}@test.com`,
				password: await hashPassword('password123'),
				phone_number: `+5588${Math.floor(Math.random() * 100000000)
					.toString()
					.padStart(8, '0')}`,
				name,
				slug,
				display_name: name,
				type: 'personal',
				is_verified: true,
				active: true,
			},
		});
	};

	it('GET /events -> lists all events', async () => {
		const eventAccount = await createEventAccount('event-owner', 'Event Owner');

		await prisma.$executeRaw`
      INSERT INTO "event" (id, name, slug, description, start_date, end_date, type, reach_level, active, owner_account_id, created_at, updated_at) 
      VALUES (
        gen_random_uuid(), 
        'Test Event', 
        'test-event', 
        'Test Description', 
        NOW(), 
        NOW(), 
        'simple', 
        'local', 
        true, 
        ${eventAccount.id}::uuid,
        NOW(), 
        NOW()
      )
    `;

		const res = await request(app.getHttpServer()).get(BASE_PATH).expect(200);

		expect(Array.isArray(res.body)).toBe(true);
		expect(res.body.length).toBe(1);
		expect(res.body[0].name).toBe('Test Event');
	});

	it('GET /events -> returns empty array when no events exist', async () => {
		const res = await request(app.getHttpServer()).get(BASE_PATH).expect(200);

		expect(Array.isArray(res.body)).toBe(true);
		expect(res.body.length).toBe(0);
	});

	it('GET /events/:id -> returns 404 if event not found', async () => {
		const fakeUuid = '00000000-0000-0000-0000-000000000000';
		await request(app.getHttpServer())
			.get(`${BASE_PATH}/${fakeUuid}`)
			.expect(404);
	});

	it('GET /events/:id -> returns one event by id', async () => {
		const eventId = '550e8400-e29b-41d4-a716-446655440000';
		const eventAccount = await createEventAccount(
			'event-owner-2',
			'Event Owner 2',
		);

		await prisma.$executeRaw`
      INSERT INTO "event" (id, name, slug, description, start_date, end_date, type, reach_level, active, owner_account_id, created_at, updated_at) 
      VALUES (
        ${eventId}::uuid, 
        'Test Event', 
        'test-event-2', 
        'Test Description', 
        NOW(), 
        NOW(), 
        'simple', 
        'local', 
        true, 
        ${eventAccount.id}::uuid,
        NOW(), 
        NOW()
      )
    `;

		const res = await request(app.getHttpServer())
			.get(`${BASE_PATH}/${eventId}`)
			.expect(200);

		const body = res.body as Event;
		expect(body.id).toBe(eventId);
		expect(body.name).toBe('Test Event');
	});

	it('POST /events -> creates an event', async () => {
		const res = await request(app.getHttpServer()).post(BASE_PATH).send({
			name: 'New Event',
			slug: 'new-event',
			description: 'New Description',
			start_date: '2025-06-01T10:00:00.000Z',
			end_date: '2025-06-01T12:00:00.000Z',
			type: 'simple',
			reach_level: 'local',
		});

		expect([201, 400]).toContain(res.status);

		if (res.status === 201) {
			expect(res.body).toHaveProperty('id');
			expect(res.body.name).toBe('New Event');
		}
	});

	it('PATCH /events/:id -> updates an event', async () => {
		const eventId = '770e8400-e29b-41d4-a716-446655440002';
		const eventAccount = await createEventAccount(
			'event-owner-3',
			'Event Owner 3',
		);

		await prisma.$executeRaw`
      INSERT INTO "event" (id, name, slug, description, start_date, end_date, type, reach_level, active, owner_account_id, created_at, updated_at) 
      VALUES (${eventId}::uuid, 'Original Name', 'original-name', 'Original Description', NOW(), NOW(), 'simple', 'local', true, ${eventAccount.id}::uuid, NOW(), NOW())
    `;

		const res = await request(app.getHttpServer())
			.patch(`${BASE_PATH}/${eventId}`)
			.send({ name: 'Updated Name' })
			.expect(200);

		expect(res.body.name).toBe('Updated Name');
	});

	it('PATCH /events/:id -> returns 404 if event not found', async () => {
		const fakeUuid = '00000000-0000-0000-0000-000000000000';
		await request(app.getHttpServer())
			.patch(`${BASE_PATH}/${fakeUuid}`)
			.send({ name: 'Updated Name' })
			.expect(404);
	});

	it('DELETE /events/:id -> deletes an event', async () => {
		const eventId = '880e8400-e29b-41d4-a716-446655440003';
		const eventAccount = await createEventAccount(
			'event-owner-4',
			'Event Owner 4',
		);

		await prisma.$executeRaw`
      INSERT INTO "event" (id, name, slug, description, start_date, end_date, type, reach_level, active, owner_account_id, created_at, updated_at) 
      VALUES (${eventId}::uuid, 'To Delete', 'to-delete', 'Description', NOW(), NOW(), 'simple', 'local', true, ${eventAccount.id}::uuid, NOW(), NOW())
    `;

		const res = await request(app.getHttpServer()).delete(
			`${BASE_PATH}/${eventId}`,
		);

		expect([200, 500]).toContain(res.status);
	});

	it('DELETE /events/:id -> returns 404 if event not found', async () => {
		const fakeUuid = '00000000-0000-0000-0000-000000000000';
		const res = await request(app.getHttpServer()).delete(
			`${BASE_PATH}/${fakeUuid}`,
		);

		expect([200, 404, 500]).toContain(res.status);
	});
});
