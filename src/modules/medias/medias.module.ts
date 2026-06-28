import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MediasController } from './medias.controller';
import { MediasService } from './medias.service';

@Module({
	imports: [ConfigModule],
	controllers: [MediasController],
	providers: [MediasService],
	exports: [MediasService],
})
export class MediasModule {}
