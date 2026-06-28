import { ApiProperty } from '@nestjs/swagger';
import { account_type } from '@prisma/client';
import {
	IsEmail,
	IsString,
	Matches,
	MaxLength,
	MinLength,
	IsOptional,
	IsEnum,
} from 'class-validator';

export class CreateAccountDTO {
	@ApiProperty({ example: 'João Silva' })
	@MaxLength(100)
	@IsString()
	name: string;

	@ApiProperty({ example: 'joao@email.com' })
	@IsString()
	@MaxLength(254)
	@IsEmail()
	email: string;

	@ApiProperty({
		example: '+5511999998888',
		description: 'Telefone no formato E.164',
	})
	@IsString()
	@Matches(/^\+[1-9]\d{1,14}$/)
	phone_number: string;

	// @ApiProperty({ example: '2000-01-01T00:00:00.000Z' })
	// @IsDate()
	// @MaxDate(new Date())
	// @Type(() => Date)
	// birth_date: Date;

	@ApiProperty({ example: 'Senha@123', minLength: 8 })
	@IsString()
	@MinLength(8)
	password: string;

	@ApiProperty({ example: 'Senha@123', minLength: 8 })
	@IsString()
	@MinLength(8)
	password_confirm: string;

	// Profile fields
	@ApiProperty({
		example: 'joaosilva',
		description: 'Unique slug for the account',
	})
	@MaxLength(100)
	@IsString()
	slug: string;

	@ApiProperty({
		example: 'João Silva',
		description: 'Display name for the account',
	})
	@MaxLength(150)
	@IsString()
	display_name: string;

	@ApiProperty({
		example: 'Software developer passionate about technology',
		required: false,
	})
	@IsOptional()
	@IsString()
	bio?: string;

	@ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
	@IsOptional()
	@IsString()
	avatar_url?: string;

	@ApiProperty({ enum: account_type, example: 'personal', required: false })
	@IsOptional()
	@IsEnum(account_type)
	type?: account_type;
}
