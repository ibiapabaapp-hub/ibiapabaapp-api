import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { profile_type } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProfileDTO {
	@ApiProperty({ description: 'Slug único para o perfil', example: 'john-doe' })
	@IsString()
	@MaxLength(100)
	slug: string;

	@ApiProperty({ description: 'Nome de exibição', example: 'John Doe' })
	@IsString()
	@MaxLength(150)
	display_name: string;

	@ApiPropertyOptional({ description: 'Biografia' })
	@IsOptional()
	@IsString()
	bio?: string;

	@ApiPropertyOptional({ description: 'URL do avatar' })
	@IsOptional()
	@IsString()
	avatar_url?: string;

	@ApiProperty({
		description: 'Tipo do perfil',
		enum: profile_type,
		example: 'personal',
	})
	@IsEnum(profile_type)
	type: profile_type;
}
