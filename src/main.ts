import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { Request, Response } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { printLogoFromFile } from './common/utils/print-logo-from-file';
import pc from 'picocolors';

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

    await app.listen(process.env.PORT ?? 3000);
    await app.init();
  }
  return app.getHttpAdapter().getInstance();
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

if (process.env.NODE_ENV === 'development') {
  printLogoFromFile('logo-ascii.txt');
  console.log(
    `🚀 API running on ${pc.greenBright('http://localhost:' + process.env.PORT)}`,
  );
  console.log(
    `📃 Docs on ${pc.greenBright('http://localhost:' + process.env.PORT + '/docs')}`,
  );
}

export default async (req: Request, res: Response) => {
  const instance = await bootstrap();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return instance(req, res);
};
