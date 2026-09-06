import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class ChangeEmailDto {
	@ApiProperty({ example: 'novo@email.com' })
	@IsString()
	@MaxLength(254)
	@IsEmail()
	email: string;
}
