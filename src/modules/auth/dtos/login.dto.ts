import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
	@ApiProperty({
		example: 'usuario@email.com',
		description: 'E-mail cadastrado',
	})
	@IsString()
	@MaxLength(254)
	@IsEmail()
	email: string;

	@ApiProperty({
		example: 'Senha@123',
		description: 'Senha do usuário',
		minLength: 8,
	})
	@IsString()
	@MinLength(8)
	password: string;
}
