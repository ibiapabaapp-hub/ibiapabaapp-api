import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class ForgotPasswordDto {
	@ApiProperty({ example: 'joao@email.com' })
	@IsString()
	@MaxLength(254)
	@IsEmail()
	email: string;
}
