import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/modules/common/prisma/prisma.module';
import { MediasModule } from 'src/modules/medias/medias.module';

import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

@Module({
	imports: [PrismaModule, MediasModule],
	controllers: [CompaniesController],
	providers: [CompaniesService],
})
export class CompaniesModule {}
