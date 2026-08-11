import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import {
	IsBoolean,
	IsEnum,
	IsOptional,
	IsString,
	IsUUID,
	MaxLength,
} from 'class-validator';

export class CreateBusinessDTO {
	@ApiProperty({ format: 'uuid' })
	@IsUUID()
	account_id: string;
	@ApiPropertyOptional({ enum: $Enums.reach_level })
	@IsOptional()
	@IsEnum($Enums.reach_level)
	max_reach_level: $Enums.reach_level;
	@IsUUID()
	id: string;
	@IsString()
	@MaxLength(100)
	slug: string;
	@IsOptional()
	@IsString()
	@MaxLength(20)
	cnpj: string | null;
	@IsOptional()
	@IsString()
	cover_img_url: string | null;
	@IsOptional()
	@IsString()
	description: string | null;
	@IsBoolean()
	active: boolean;
	@IsOptional()
	created_at: Date;
	@IsOptional()
	updated_at: Date;
}
