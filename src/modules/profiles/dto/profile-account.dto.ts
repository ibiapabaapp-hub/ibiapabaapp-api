import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional } from 'class-validator';

export class ProfileAccountIdDTO {
	@ApiProperty({ description: 'UUID da conta', example: 'uuid' })
	@IsUUID()
	accountId: string;
}

export class CreateProfileWithAccountDTO {
	@ApiProperty({ description: 'UUID da conta', example: 'uuid' })
	@IsUUID()
	accountId: string;

	@ApiProperty({ description: 'Slug do perfil', example: 'my-profile' })
	slug: string;

	@ApiProperty({ description: 'Nome de exibição', example: 'My Profile' })
	display_name: string;

	@ApiProperty({
		description: 'Tipo do perfil',
		example: 'personal',
		enum: ['personal', 'business'],
	})
	type: 'personal' | 'business';

	@ApiProperty({
		description: 'Bio do perfil',
		example: 'About me',
		required: false,
	})
	@IsOptional()
	bio?: string;

	@ApiProperty({
		description: 'URL do avatar',
		example: 'https://example.com/avatar.jpg',
		required: false,
	})
	@IsOptional()
	avatar_url?: string;
}

export class UpdateProfileWithAccountDTO {
	@ApiProperty({ description: 'UUID da conta', example: 'uuid' })
	@IsUUID()
	accountId: string;

	@ApiProperty({
		description: 'Slug do perfil',
		example: 'my-profile',
		required: false,
	})
	@IsOptional()
	slug?: string;

	@ApiProperty({
		description: 'Nome de exibição',
		example: 'My Profile',
		required: false,
	})
	@IsOptional()
	display_name?: string;

	@ApiProperty({
		description: 'Bio do perfil',
		example: 'About me',
		required: false,
	})
	@IsOptional()
	bio?: string;

	@ApiProperty({
		description: 'URL do avatar',
		example: 'https://example.com/avatar.jpg',
		required: false,
	})
	@IsOptional()
	avatar_url?: string;
}

export class UpsertInterestsWithAccountDTO {
	@ApiProperty({ description: 'UUID da conta', example: 'uuid' })
	@IsUUID()
	accountId: string;

	@ApiProperty({
		description: 'Lista de categorias de interesse',
		type: [String],
		example: ['uuid1', 'uuid2'],
	})
	interests: string[];
}
