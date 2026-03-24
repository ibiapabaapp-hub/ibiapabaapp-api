import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { PrismaModule } from 'src/modules/common/prisma/prisma.module';
import { MediasModule } from 'src/modules/medias/medias.module';

@Module({
  imports: [PrismaModule, MediasModule],
  controllers: [CompaniesController],
  providers: [CompaniesService],
})
export class CompaniesModule {}
