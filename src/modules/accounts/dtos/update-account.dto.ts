import { ApiPropertyOptional } from '@nestjs/swagger';
import { account_type } from '@prisma/client';
import {
	IsBoolean,
	IsEmail,
	IsOptional,
	IsString,
	MinLength,
	MaxLength,
	IsEnum,
} from 'class-validator';

export class UpdateAccountDTO {
	@ApiPropertyOptional({ example: 'João Silva' })
	@IsString()
	@IsOptional()
	name?: string;

	@ApiPropertyOptional({ example: 'joao@email.com' })
	@IsString()
	@IsEmail()
	@IsOptional()
	email?: string;

	@ApiPropertyOptional({ example: 'NovaSenha@123', minLength: 8 })
	@IsString()
	@MinLength(8)
	@IsOptional()
	password?: string;

	@ApiPropertyOptional({ example: true })
	@IsBoolean()
	@IsOptional()
	active?: boolean;

	// Profile fields
	@ApiPropertyOptional({
		example: 'joaosilva',
		description: 'Unique slug for the account',
	})
	@IsString()
	@MaxLength(100)
	@IsOptional()
	slug?: string;

	@ApiPropertyOptional({
		example: 'João Silva',
		description: 'Display name for the account',
	})
	@IsString()
	@MaxLength(150)
	@IsOptional()
	display_name?: string;

	@ApiPropertyOptional({
		example: 'Software developer passionate about technology',
		description: 'Account biography',
	})
	@IsString()
	@IsOptional()
	bio?: string;

	@ApiPropertyOptional({
		example: 'https://example.com/avatar.jpg',
		description: 'URL for account avatar image',
	})
	@IsString()
	@IsOptional()
	avatar_url?: string;

	@ApiPropertyOptional({
		enum: account_type,
		example: 'personal',
		description: 'Account type: personal or business',
	})
	@IsEnum(account_type)
	@IsOptional()
	type?: account_type;
}
