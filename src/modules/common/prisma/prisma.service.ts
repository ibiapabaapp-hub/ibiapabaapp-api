import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL not set');

    const adapter: Prisma.PrismaClientOptions['adapter'] = new PrismaPg({
      connectionString: url,
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
