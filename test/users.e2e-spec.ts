/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaModule } from './../src/common/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PasswordService } from 'src/common/password/password.service';
import { UsersController } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';
import { JwtService } from 'src/common/jwt/jwt.service';
import { UserRole } from '@prisma/client';

describe('Users (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let passwordService: PasswordService;
  const BASE_PATH = '/api/v1/users';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
      controllers: [UsersController],
      providers: [UsersService, PasswordService, JwtService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('/api');
    app.enableVersioning({ type: VersioningType.URI });
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    passwordService = moduleFixture.get<PasswordService>(PasswordService);

    await app.init();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  const createMockUser = async (
    email = `user_${Math.random()}@test.com`,
    role = 'superuser',
  ) => {
    return prisma.user.create({
      data: {
        name: 'Test User',
        username: `user_${Math.random()}`,
        email,
        password: await passwordService.hashPassword('password123'),
        birth_date: new Date('1990-01-01'),
        phone_number: `+55859${Math.floor(Math.random() * 90000000 + 10000000)}`,
        role: role as UserRole,
      },
    });
  };

  describe('GET /users', () => {
    it('should return a list of users without passwords', async () => {
      await createMockUser();
      const res = await request(app.getHttpServer()).get(BASE_PATH).expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      res.body.forEach((user: any) => {
        expect(user.password).toBeUndefined();
        expect(user).not.toHaveProperty('password');
      });
    });
  });

  describe('GET /users/:id', () => {
    it('should return a single user without password', async () => {
      const user = await createMockUser();
      const res = await request(app.getHttpServer())
        .get(`${BASE_PATH}/${user.id}`)
        .expect(200);

      expect(res.body.id).toBe(user.id);
      expect(res.body.password).toBeUndefined();
      expect(res.body).not.toHaveProperty('password');
    });

    it('should return 404 for non-existing user', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .get(`${BASE_PATH}/${fakeId}`)
        .expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update user successfully and not return password', async () => {
      const user = await createMockUser('update@test.com');

      const res = await request(app.getHttpServer())
        .patch(`${BASE_PATH}/${user.id}`)
        .send({
          name: 'Novo Nome',
          password: 'password123',
          role: 'user',
        })
        .expect(200);

      expect(res.body.name).toBe('Novo Nome');
      expect(res.body.password).toBeUndefined();
      expect(res.body).not.toHaveProperty('password');
    });

    it('should return 401 if current password is wrong', async () => {
      const user = await createMockUser('auth-fail@test.com');

      await request(app.getHttpServer())
        .patch(`${BASE_PATH}/${user.id}`)
        .send({
          name: 'Fail',
          password: 'wrong_password',
        })
        .expect(401);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should remove a user and return deleted user data without password', async () => {
      const user = await createMockUser();
      const res = await request(app.getHttpServer())
        .delete(`${BASE_PATH}/${user.id}`)
        .expect(200);

      expect(res.body.password).toBeUndefined();

      const check = await prisma.user.findUnique({ where: { id: user.id } });
      expect(check).toBeNull();
    });
  });
});
