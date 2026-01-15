import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { Lead } from 'src/leads/entities/lead.entity';
import { PrismaService } from 'src/common/prisma/prisma.service';

describe('leads (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    await app.init();
  });

  afterEach(async () => {
    await prisma.leads.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('POST /leads -> creates a lead', async () => {
    const res = await request(app.getHttpServer()).post('/leads').send({
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
    // Cria um lead primeiro
    await prisma.leads.create({
      data: {
        name: 'Test Lead',
        email: 'test@example.com',
        phone_number: '(00) 0 0000-000',
        type: 'resident',
      },
    });

    const res = await request(app.getHttpServer()).get('/leads').expect(200);

    const body = res.body as Lead[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  it('GET /leads/:id -> list one lead', async () => {
    const created = await prisma.leads.create({
      data: {
        name: 'Test Lead',
        email: 'test@example.com',
        phone_number: '(00) 0 0000-000',
        type: 'resident',
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/leads/${created.id}`)
      .expect(200);

    const body = res.body as Lead;
    expect(body.id).toBe(created.id);
  });

  it('PATCH /leads/:id -> updates the lead', async () => {
    const created = await prisma.leads.create({
      data: {
        name: 'Test Lead',
        email: 'test@example.com',
        phone_number: '(00) 0 0000-000',
        type: 'resident',
      },
    });

    const res = await request(app.getHttpServer())
      .patch(`/leads/${created.id}`)
      .send({ name: 'John Updated' })
      .expect(200);

    const body = res.body as Lead;
    expect(body.name).toBe('John Updated');
  });

  it('DELETE /leads/:id -> removes the lead', async () => {
    const created = await prisma.leads.create({
      data: {
        name: 'Test Lead',
        email: 'test@example.com',
        phone_number: '(00) 0 0000-0000',
        type: 'resident',
      },
    });

    const res = await request(app.getHttpServer())
      .delete(`/leads/${created.id}`)
      .expect(200);

    expect(res.body).toHaveProperty('message');

    await request(app.getHttpServer()).get(`/leads/${created.id}`).expect(404);
  });
});
