import { Module } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { MediasModule } from 'src/medias/medias.module';

@Module({
  imports: [PrismaModule, MediasModule],
  controllers: [CitiesController],
  providers: [CitiesService],
})
export class CitiesModule {}
