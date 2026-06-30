import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/modules/common/prisma/prisma.module';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { TagGroupsService } from './tag-groups.service';

@Module({
	imports: [PrismaModule],
	controllers: [TagsController],
	providers: [TagsService, TagGroupsService],
	exports: [TagsService, TagGroupsService],
})
export class TagsModule {}
