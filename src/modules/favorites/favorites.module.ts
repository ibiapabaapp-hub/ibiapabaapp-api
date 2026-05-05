import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/modules/common/prisma/prisma.module';

import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

// TODO: testes e2e
@Module({
	imports: [PrismaModule],
	controllers: [FavoritesController],
	providers: [FavoritesService],
})
export class FavoritesModule {}
