import { ApiProperty } from '@nestjs/swagger';
import {
	IsEmail,
	IsString,
	Matches,
	MaxLength,
	MinLength,
} from 'class-validator';

export class RegisterDto {
	@ApiProperty({ example: 'João Silva' })
	@MaxLength(100)
	@IsString()
	name: string;

	@ApiProperty({ example: 'joaosilva' })
	@MaxLength(50)
	@MinLength(4)
	@IsString()
	username: string;

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
}
