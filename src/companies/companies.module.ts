import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { MediasService } from 'src/medias/medias.service';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService, PrismaService, MediasService],
})
export class CompaniesModule {}
