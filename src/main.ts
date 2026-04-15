import {
	ClassSerializerInterceptor,
	ValidationPipe,
	VersioningType,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { NextFunction, Request, Response } from 'express';
import pc from 'picocolors';

import { AppModule } from './modules/app/app.module';

let app: NestExpressApplication;

export async function bootstrap() {
	if (!app) {
		app = await NestFactory.create<NestExpressApplication>(AppModule, {
			logger: ['error', 'warn'],
		});

		app.useGlobalInterceptors(
			new ClassSerializerInterceptor(app.get(Reflector)),
		);

		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
				forbidNonWhitelisted: true,
				forbidUnknownValues: true,
				transform: true,
			}),
		);

		app.setGlobalPrefix('/api');

		app.enableVersioning({
			type: VersioningType.URI,
			defaultVersion: '1',
		});

		app.use(cookieParser());

		app.enableCors({
			origin: [
				'http://localhost:3001',
				'https://ibiapabaapp.com.br',
				'https://www.ibiapabaapp.com.br',
				'https://ibiapabaapp-landingpage.vercel.app',
			],
			methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
			credentials: true,
			allowedHeaders: [
				'Content-Type',
				'Authorization',
				'x-refresh-token',
				'ngrok-skip-browser-warning',
			],
			// credentials: true,
			// cookies no CORS
		});

		const config = new DocumentBuilder()
			.setTitle('IbiapabaAppAPI')
			.setDescription(
				'Ponte entre o IbiapabaApp mobile e web para a persistência de dados',
			)
			.setVersion('1.0')
			.build();

		if (process.env.NODE_ENV !== 'production') {
			const document = SwaggerModule.createDocument(app, config);
			SwaggerModule.setup('docs', app, document);
		}

		if (process.env.NODE_ENV === 'development') {
			app.use((_, res: Response, next: NextFunction) => {
				res.setHeader('ngrok-skip-browser-warning', 'true');
				next();
			});
		}

		await app.listen(process.env.PORT ?? 3000);
		await app.init();

		if (process.env.NODE_ENV === 'development') {
			showBootstrapLogs();
		}
	}
	return app.getHttpAdapter().getInstance();
}

if (process.env.NODE_ENV !== 'test') {
	bootstrap().catch((err) => {
		console.error(err);
		process.exit(1);
	});
}

function showBootstrapLogs() {
	console.log(pc.bold('IbiapabaApp API'));
	console.log(
		`  🚀 Running on ${pc.greenBright('http://localhost:' + process.env.PORT)}`,
	);
	console.log(
		`  📃 Docs on ${pc.cyanBright('http://localhost:' + process.env.PORT + '/docs')}`,
	);
}

export default async (req: Request, res: Response) => {
	const instance = await bootstrap();
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return instance(req, res);
};
