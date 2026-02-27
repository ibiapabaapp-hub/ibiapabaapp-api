import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { Request, Response } from 'express';

let app: NestExpressApplication;

export async function bootstrap() {
  if (!app) {
    app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn'],
    });

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
      // credentials: true,
      // cookies no CORS
    });

    await app.listen(process.env.PORT ?? 3000);
    await app.init();
  }
  return app.getHttpAdapter().getInstance();
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});

export default async (req: Request, res: Response) => {
  const instance = await bootstrap();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return instance(req, res);
};
