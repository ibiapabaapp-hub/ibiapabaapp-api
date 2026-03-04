import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { Lead } from 'src/leads/entities/lead.entity';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { LeadsModule } from 'src/leads/leads.module';

describe('leads (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const BASE_PATH = '/api/v1/leads';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        LeadsModule,
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
    await prisma.lead.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('POST /leads -> creates a lead', async () => {
    const res = await request(app.getHttpServer()).post(BASE_PATH).send({
      name: 'John Doe',
      email: 'john@example.com',
      phone_number: '(85) 9 9999-9999',
      type: 'resident',
    });

    expect(res.status).toBe(201);

    const body = res.body as Lead;
    expect(body).toHaveProperty('id');
    expect(body.email).toBe('john@example.com');
    expect(body.name).toBe('John Doe');
    expect(body.type).toBe('resident');
  });

  it('GET /leads -> lists all leads', async () => {
    await prisma.lead.create({
      data: {
        name: 'Test Lead',
        email: 'test@example.com',
        phone_number: '(00) 0 0000-000',
        type: 'resident',
      },
    });

    const res = await request(app.getHttpServer()).get(BASE_PATH).expect(200);

    const body = res.body as Lead[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  it('GET /leads/:id -> list one lead', async () => {
    const created = await prisma.lead.create({
      data: {
        name: 'Test Lead',
        email: 'test@example.com',
        phone_number: '(00) 0 0000-000',
        type: 'resident',
      },
    });

    const res = await request(app.getHttpServer())
      .get(`${BASE_PATH}/${created.id}`)
      .expect(200);

    const body = res.body as Lead;
    expect(body.id).toBe(created.id);
  });

  it('PATCH /leads/:id -> updates the lead', async () => {
    const created = await prisma.lead.create({
      data: {
        name: 'Test Lead',
        email: 'test@example.com',
        phone_number: '(00) 0 0000-000',
        type: 'resident',
      },
    });

    const res = await request(app.getHttpServer())
      .patch(`${BASE_PATH}/${created.id}`)
      .send({ name: 'John Updated' })
      .expect(200);

    const body = res.body as Lead;
    expect(body.name).toBe('John Updated');
  });

  it('DELETE /leads/:id -> removes the lead', async () => {
    const created = await prisma.lead.create({
      data: {
        name: 'Test Lead',
        email: 'test@example.com',
        phone_number: '(00) 0 0000-0000',
        type: 'resident',
      },
    });

    const res = await request(app.getHttpServer())
      .delete(`${BASE_PATH}/${created.id}`)
      .expect(200);

    expect(res.body).toHaveProperty('message');

    await request(app.getHttpServer())
      .get(`${BASE_PATH}/${created.id}`)
      .expect(404);
  });
});
