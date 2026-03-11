/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CompaniesModule } from 'src/companies/companies.module';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

describe('Companies (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const BASE_PATH = '/api/v1/companies';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        CompaniesModule,
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
    await prisma.$executeRaw`TRUNCATE TABLE "Company" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Category" RESTART IDENTITY CASCADE`;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('GET /companies -> deve listar empresas com seus nomes de categorias mapeados', async () => {
    // 1. Criar Categoria
    const category = await prisma.category.create({
      data: { name: 'Alimentação' },
    });

    // 2. Criar Empresa
    const company = await prisma.company.create({
      data: {
        name: 'Restaurante Serra',
        slug: 'restaurante-serra',
        active: true,
      },
    });

    // 3. Criar Vínculo na tabela intermediária (CompanyCategory)
    await prisma.companyCategory.create({
      data: {
        company_id: company.id,
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
    const company = await prisma.company.create({
      data: { name: 'Pousada Flor', slug: 'pousada-flor' },
    });
    await prisma.companyCategory.create({
      data: { company_id: company.id, category_id: category.id },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .get(`${BASE_PATH}/${company.id}`)
      .expect(200);

    expect(res.body.id).toBe(company.id);
    expect(res.body.categories).toEqual(['Hotelaria']);
  });
});
