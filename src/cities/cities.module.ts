import { Module } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { MediasService } from 'src/medias/medias.service';

@Module({
  controllers: [CitiesController],
  providers: [CitiesService, PrismaService, MediasService],
})
export class CitiesModule {}
