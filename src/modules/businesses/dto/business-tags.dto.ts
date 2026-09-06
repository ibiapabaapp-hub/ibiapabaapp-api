import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class UpdateBusinessTagsDto {
	@ApiProperty({ type: [String], format: 'uuid' })
	@IsArray()
	@IsUUID(undefined, { each: true })
	tag_ids: string[];
}
