/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { Category } from 'src/categories/entities/category.entity';

describe('Categories (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const BASE_PATH = '/api/v1/categories';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        CategoriesModule,
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
    await prisma.$executeRaw`TRUNCATE TABLE "category" RESTART IDENTITY CASCADE`;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('GET /categories -> lists all categories', async () => {
    await prisma.category.create({
      data: {
        name: 'Test Category',
      },
    });

    const res = await request(app.getHttpServer()).get(BASE_PATH).expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Test Category');
  });

  it('GET /categories -> returns empty array when no categories exist', async () => {
    const res = await request(app.getHttpServer()).get(BASE_PATH).expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('GET /categories/:id -> returns 404 if category not found', async () => {
    const fakeUuid = '00000000-0000-0000-0000-000000000000';
    await request(app.getHttpServer())
      .get(`${BASE_PATH}/${fakeUuid}`)
      .expect(404);
  });

  it('GET /categories/:id -> returns one category by id', async () => {
    const categoryId = '550e8400-e29b-41d4-a716-446655440000';

    await prisma.category.create({
      data: {
        id: categoryId,
        name: 'Test Category',
        parent_id: null,
      },
    });

    const res = await request(app.getHttpServer())
      .get(`${BASE_PATH}/${categoryId}`)
      .expect(200);

    const body = res.body as Category;
    expect(body.id).toBe(categoryId);
    expect(body.name).toBe('Test Category');
  });

  it('POST /categories -> creates a category', async () => {
    const res = await request(app.getHttpServer())
      .post(BASE_PATH)
      .send({ name: 'New Category', parent_id: null })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('New Category');
  });

  it('POST /categories -> creates a category with parent', async () => {
    const parentId = '660e8400-e29b-41d4-a716-446655440001';

    await prisma.category.create({
      data: {
        id: parentId,
        name: 'Parent Category',
        parent_id: null,
      },
    });

    const res = await request(app.getHttpServer())
      .post(BASE_PATH)
      .send({ name: 'Child Category', parent_id: parentId })
      .expect(201);

    expect(res.body.name).toBe('Child Category');
  });

  it('PATCH /categories/:id -> updates a category', async () => {
    const categoryId = '770e8400-e29b-41d4-a716-446655440002';

    await prisma.category.create({
      data: {
        id: categoryId,
        name: 'Original Name',
      },
    });

    const res = await request(app.getHttpServer())
      .patch(`${BASE_PATH}/${categoryId}`)
      .send({ name: 'Updated Name' })
      .expect(200);

    expect(res.body.name).toBe('Updated Name');
  });

  it('PATCH /categories/:id -> returns 404 if category not found', async () => {
    const fakeUuid = '00000000-0000-0000-0000-000000000000';
    await request(app.getHttpServer())
      .patch(`${BASE_PATH}/${fakeUuid}`)
      .send({ name: 'Updated Name' })
      .expect(404);
  });

  it('DELETE /categories/:id -> deletes a category', async () => {
    const categoryId = '880e8400-e29b-41d4-a716-446655440003';

    await prisma.category.create({
      data: {
        id: categoryId,
        name: 'To Delete',
      },
    });

    await request(app.getHttpServer())
      .delete(`${BASE_PATH}/${categoryId}`)
      .expect(200);
  });

  it('DELETE /categories/:id -> returns 404 if category not found', async () => {
    const fakeUuid = '00000000-0000-0000-0000-000000000000';
    await request(app.getHttpServer())
      .delete(`${BASE_PATH}/${fakeUuid}`)
      .expect(404);
  });
});
