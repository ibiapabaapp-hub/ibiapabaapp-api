import { ApiProperty } from '@nestjs/swagger';
import { event_type, reach_level } from '@prisma/client';
import {
	IsBoolean,
	IsDateString,
	IsIn,
	IsISO8601,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUrl,
	IsUUID,
	MaxLength,
	MinLength
} from 'class-validator';

export class CreateEventDTO {
	@ApiProperty({
		example: 'uuidv4',
		type: String,
	})
	@IsUUID('4')
	owner_profile_id: string;

	@ApiProperty({
		example: 'Evento Importante',
		minLength: 4,
		maxLength: 200,
		type: String,
	})
	@IsNotEmpty()
	@IsString()
	@MinLength(4)
	@MaxLength(200)
	name: string;

	@ApiProperty({
		example: 'Descrição do evento',
		maxLength: 300,
		type: String,
	})
	@IsOptional()
	@IsString()
	@MaxLength(300)
	description?: string;

	@IsOptional()
	@IsString()
	@IsUrl()
	cover_img_url?: string;

	@ApiProperty({
		example: 'evento-importante',
		minLength: 4,
		maxLength: 100,
		type: String,
	})
	@IsString()
	@MaxLength(100)
	@IsNotEmpty()
	slug: string;

	@ApiProperty({
		example: 'simple',
		enum: ['simple', 'featured'],
		description: 'Tipo de evento categorizado',
	})
	@IsNotEmpty()
	@IsString()
	@IsIn(['simple', 'featured'])
	type: event_type;

	@ApiProperty({ example: { active: true }, type: Boolean })
	@IsBoolean()
	active: boolean;

	@ApiProperty({
		example: 'local',
		enum: ['local', 'regional'],
		description: 'Alcance do evento',
	})
	@IsNotEmpty()
	@IsString()
	@IsIn(['local', 'regional'])
	reach_level: reach_level;

	@IsDateString()
	@IsISO8601()
	start_date: Date;

	@IsDateString()
	@IsISO8601()
	end_date: Date;
}
