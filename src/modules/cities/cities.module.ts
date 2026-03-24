import { Module } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { PrismaModule } from 'src/modules/common/prisma/prisma.module';
import { MediasModule } from 'src/modules/medias/medias.module';

@Module({
  imports: [PrismaModule, MediasModule],
  controllers: [CitiesController],
  providers: [CitiesService],
})
export class CitiesModule {}
