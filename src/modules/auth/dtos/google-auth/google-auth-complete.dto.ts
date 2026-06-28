import { account_type, gender } from '@prisma/client';
import {
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator';

export class GoogleAuthCompleteDto {
	@IsString()
	@IsNotEmpty()
	temp_token: string;

	@IsString()
	@MinLength(4)
	@MaxLength(100)
	slug: string;

	@IsEnum(account_type)
	type: account_type;

	@IsEnum(gender)
	@IsOptional()
	gender?: gender;
}
