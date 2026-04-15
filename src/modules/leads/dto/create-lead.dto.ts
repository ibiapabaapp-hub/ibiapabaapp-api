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
		example: 'business',
		enum: ['resident', 'tourist', 'business'],
		description: 'Tipo de lead categorizado',
	})
	@IsNotEmpty()
	@IsString()
	@IsIn(['resident', 'tourist', 'business'])
	@MinLength(4)
	@MaxLength(10)
	type: lead_type;

	@ApiProperty({
		example: 'Tech Solutions Ltda',
		required: false,
		description: 'Obrigatório apenas se o type for "business"',
	})
	@ValidateIf(
		(o: { type: 'resident' | 'tourist' | 'business' }) =>
			o.type === 'business',
	)
	@IsNotEmpty()
	@IsString()
	@MinLength(5)
	@MaxLength(50)
	business_name?: string;

	@ApiProperty({
		example: '(11) 9 9999-8888',
		description: 'Formato brasileiro com máscara',
	})
	@IsNotEmpty()
	@IsString()
	@Matches(/^\(\d{2}\)\s\d\s\d{4}-\d{4}$/)
	phone_number: string;
}
