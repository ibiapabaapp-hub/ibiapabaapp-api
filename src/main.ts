import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';

export async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'verbose'],
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

  const isProduction =
    process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

  if (!isProduction) {
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(
      `🚀 Application is running on: http://localhost:${port}/api/v1`,
    );
  }

  await app.init();
  return app.getHttpAdapter().getInstance();
}

if (require.main === module) {
  bootstrap().catch((err) => {
    console.error('💥 Error during bootstrap:', err);
    process.exit(1);
  });
}

// 6. Exportação para Vercel
export default bootstrap;
