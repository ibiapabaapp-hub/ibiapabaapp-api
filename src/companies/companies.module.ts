import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { MediasModule } from 'src/medias/medias.module';

@Module({
  imports: [PrismaModule, MediasModule],
  controllers: [CompaniesController],
  providers: [CompaniesService],
})
export class CompaniesModule {}
