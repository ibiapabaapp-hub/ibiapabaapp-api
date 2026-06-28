import {
	INestApplication,
	ValidationPipe,
	VersioningType,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/modules/app/app.module';
import request from 'supertest';
import { App } from 'supertest/types';

describe('App (e2e)', () => {
	let app: INestApplication<App>;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();

		app.setGlobalPrefix('/api');
		app.enableVersioning({ type: VersioningType.URI });

		app.useGlobalPipes(
			new ValidationPipe({ whitelist: true, transform: true }),
		);

		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	describe('/', () => {
		it('/ (GET)', async () => {
			await request(app.getHttpServer())
				.get('/api/v1')
				.expect(200)
				.expect({ message: 'Hello IbiVibe!' });
		});
	});
});
