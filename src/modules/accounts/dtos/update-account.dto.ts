import { Type } from 'class-transformer';
import {
	IsBoolean,
	IsDate,
	IsEmail,
	IsEnum,
	IsOptional,
	IsString,
	MaxDate,
	MinLength,
} from 'class-validator';

export class UpdateAccountDTO {
	@IsString()
	@IsOptional()
	name?: string;

	// @IsDate()
	// @MaxDate(new Date())
	// @Type(() => Date)
	// @IsOptional()
	// birth_date?: Date;

	@IsString()
	@IsEmail()
	@IsOptional()
	email?: string;

	@IsString()
	@MinLength(8)
	@IsOptional()
	password?: string;

	@IsBoolean()
	@IsOptional()
	active?: boolean;
}
