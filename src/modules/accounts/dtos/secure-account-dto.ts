import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { account_type } from '@prisma/client';
import { Expose } from 'class-transformer';

export class SecureAccountDTO {
	@ApiProperty({
		example: 'uuid-string',
		description: 'Account unique identifier',
	})
	@Expose()
	id: string;

	@ApiProperty({
		example: 'joao@email.com',
		description: 'Account email address',
	})
	@Expose()
	email: string;

	@ApiProperty({ example: 'João Silva', description: 'Account holder name' })
	@Expose()
	name: string;

	@ApiPropertyOptional({
		example: '+5511999998888',
		description: 'Phone number in E.164 format',
	})
	@Expose()
	phone_number?: string | null;

	@ApiProperty({ example: true, description: 'Whether the account is active' })
	@Expose()
	active: boolean;

	@ApiProperty({
		example: false,
		description: 'Whether the account is verified',
	})
	@Expose()
	is_verified: boolean;

	@ApiProperty({
		example: '2024-01-01T00:00:00.000Z',
		description: 'Account creation date',
	})
	@Expose()
	created_at: Date;

	@ApiProperty({
		example: '2024-01-01T00:00:00.000Z',
		description: 'Last update date',
	})
	@Expose()
	updated_at: Date;

	// Profile fields
	@ApiProperty({
		example: 'joaosilva',
		description: 'Unique slug for the account',
	})
	@Expose()
	slug: string;

	@ApiProperty({
		example: 'João Silva',
		description: 'Display name for the account',
	})
	@Expose()
	display_name: string;

	@ApiPropertyOptional({
		example: 'Software developer passionate about technology',
		description: 'Account biography',
	})
	@Expose()
	bio?: string;

	@ApiPropertyOptional({
		example: 'https://example.com/avatar.jpg',
		description: 'URL for account avatar image',
	})
	@Expose()
	avatar_url?: string;

	@ApiProperty({
		enum: account_type,
		example: 'personal',
		description: 'Account type: personal or business',
	})
	@Expose()
	type: account_type;

	@ApiProperty({ enum: ['user', 'admin', 'super_admin'], example: 'user' })
	@Expose()
	role: string;

	constructor(partial: any) {
		const { password: _, ...rest } = partial;
		Object.assign(this, rest);
	}
}
