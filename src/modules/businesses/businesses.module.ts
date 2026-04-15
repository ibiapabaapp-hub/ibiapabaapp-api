import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/modules/common/prisma/prisma.module';
import { MediasModule } from 'src/modules/medias/medias.module';

import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';

@Module({
	imports: [PrismaModule, MediasModule],
	controllers: [BusinessesController],
	providers: [BusinessesService],
})
export class BusinessesModule {}
