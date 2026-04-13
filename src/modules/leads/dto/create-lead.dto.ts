import { ApiProperty } from '@nestjs/swagger';
import { lead_type } from '@prisma/client';
import {
	IsEmail,
	IsIn,
	IsNotEmpty,
	IsString,
	Matches,
	MaxLength,
	MinLength,
	ValidateIf,
} from 'class-validator';

export class CreateLeadDto {
	@ApiProperty({ example: 'Bruno Oliveira', minLength: 4, maxLength: 50 })
	@IsNotEmpty()
	@IsString()
	@MinLength(4)
	@MaxLength(50)
	name: string;

	@ApiProperty({ example: 'bruno@email.com' })
	@IsNotEmpty()
	@IsEmail()
	@MaxLength(100)
	email: string;

	@ApiProperty({
		example: 'company',
		enum: ['resident', 'tourist', 'company'],
		description: 'Tipo de lead categorizado',
	})
	@IsNotEmpty()
	@IsString()
	@IsIn(['resident', 'tourist', 'company'])
	@MinLength(4)
	@MaxLength(10)
	type: lead_type;

	@ApiProperty({
		example: 'Tech Solutions Ltda',
		required: false,
		description: 'Obrigatório apenas se o type for "company"',
	})
	@ValidateIf(
		(o: { type: 'resident' | 'tourist' | 'company' }) => o.type === 'company',
	)
	@IsNotEmpty()
	@IsString()
	@MinLength(5)
	@MaxLength(50)
	company_name?: string;

	@ApiProperty({
		example: '(11) 9 9999-8888',
		description: 'Formato brasileiro com máscara',
	})
	@IsNotEmpty()
	@IsString()
	@Matches(/^\(\d{2}\)\s\d\s\d{4}-\d{4}$/)
	phone_number: string;
}
