import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/modules/common/prisma/prisma.module';
import { MediasModule } from 'src/modules/medias/medias.module';

import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';

@Module({
	imports: [PrismaModule, MediasModule],
	controllers: [CitiesController],
	providers: [CitiesService],
})
export class CitiesModule {}
