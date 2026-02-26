import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { bootstrap } from './main';

jest.mock('@nestjs/core', () => {
  const originalModule = jest.requireActual('@nestjs/core');
  return {
    ...originalModule,
    NestFactory: {
      create: jest.fn(),
    },
  };
});

describe('main bootstrap', () => {
  let app: Partial<NestExpressApplication>;

  beforeEach(() => {
    app = {
      useGlobalPipes: jest.fn(),
      setGlobalPrefix: jest.fn(),
      enableVersioning: jest.fn(),
      use: jest.fn(),
      enableCors: jest.fn(),
      listen: jest.fn(),
    };

    jest.clearAllMocks();
    (NestFactory.create as jest.Mock).mockResolvedValue(app);
  });

  it('should bootstrap the application correctly', async () => {
    process.env.PORT = '4000';

    await bootstrap();

    expect(NestFactory.create).toHaveBeenCalled();

    expect(app.useGlobalPipes).toHaveBeenCalledWith(expect.any(ValidationPipe));

    expect(app.setGlobalPrefix).toHaveBeenCalledWith('/api');

    expect(app.enableVersioning).toHaveBeenCalledWith({
      type: VersioningType.URI,
    });

    expect(app.use).toHaveBeenCalledWith(expect.any(Function));

    expect(app.enableCors).toHaveBeenCalledWith({
      origin: [
        'http://localhost:3001',
        'https://ibiapabaapp.com.br',
        'https://www.ibiapabaapp.com.br',
        'https://ibiapabaapp-landingpage.vercel.app',
      ],
    });

    expect(app.listen).toHaveBeenCalledWith('4000');
  });

  it('should exit process on bootstrap error', async () => {
    const error = new Error('bootstrap failed');

    (NestFactory.create as jest.Mock).mockRejectedValue(error);

    await expect(bootstrap()).rejects.toThrow(error);
  });
});
