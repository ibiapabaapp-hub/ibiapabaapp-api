import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateFavoriteDTO {
	@ApiProperty({
		example: '550e8400-e29b-41d4-a716-446655440000',
		description: 'UUID do perfil que está favoritando',
		type: String,
	})
	@IsUUID('4')
	@IsNotEmpty()
	profile_id: string;

	@ApiProperty({
		example: '550e8400-e29b-41d4-a716-446655440001',
		description: 'UUID da cidade favorita (opcional)',
		type: String,
		required: false,
	})
	@IsOptional()
	@IsUUID('4')
	city_id?: string | null;

	@ApiProperty({
		example: '550e8400-e29b-41d4-a716-446655440002',
		description: 'UUID do evento favorito (opcional)',
		type: String,
		required: false,
	})
	@IsOptional()
	@IsUUID('4')
	event_id?: string | null;

	@ApiProperty({
		example: '550e8400-e29b-41d4-a716-446655440003',
		description: 'UUID do perfil de negócio favorito (opcional)',
		type: String,
		required: false,
	})
	@IsOptional()
	@IsUUID('4')
	business_profile_id?: string | null;
}
