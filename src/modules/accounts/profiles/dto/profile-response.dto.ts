import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { profile_type } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

class CategoryInterestDTO {
	@ApiProperty({ description: 'ID da categoria' })
	@Expose()
	id: string;

	@ApiProperty({ description: 'Nome da categoria' })
	@Expose()
	name: string;
}

export class ProfileResponseDTO {
	@ApiProperty({ description: 'ID do perfil', example: 'uuid' })
	@Expose()
	id: string;

	@ApiProperty({ description: 'Slug único', example: 'john-doe' })
	@Expose()
	slug: string;

	@ApiProperty({ description: 'Nome de exibição', example: 'John Doe' })
	@Expose()
	display_name: string;

	@ApiPropertyOptional({ description: 'Biografia' })
	@Expose()
	bio?: string;

	@ApiPropertyOptional({ description: 'URL do avatar' })
	@Expose()
	avatar_url?: string;

	@ApiProperty({ description: 'Tipo do perfil', enum: profile_type })
	@Expose()
	type: profile_type;

	@ApiProperty({ description: 'Data de criação' })
	@Expose()
	created_at: Date;

	@ApiProperty({ description: 'Data de atualização' })
	@Expose()
	updated_at: Date;

	@ApiPropertyOptional({
		description: 'Interesses do perfil',
		type: [CategoryInterestDTO],
	})
	@Expose()
	@Type(() => CategoryInterestDTO)
	interests?: CategoryInterestDTO[];
}
