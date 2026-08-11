import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
	IsArray,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	MaxLength,
	Validate,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';

function normalizeCnpj(value: unknown): unknown {
	return typeof value === 'string' ? value.replace(/\D/g, '') : value;
}

@ValidatorConstraint({ name: 'isValidCnpj', async: false })
class IsValidCnpjConstraint implements ValidatorConstraintInterface {
	validate(value: unknown): boolean {
		if (typeof value !== 'string' || !/^\d{14}$/.test(value)) return false;
		if (/^(\d)\1{13}$/.test(value)) return false;

		const calculateDigit = (cnpj: string, length: number) => {
			const weights =
				length === 12
					? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
					: [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
			const sum = cnpj
				.slice(0, length)
				.split('')
				.reduce(
					(total, digit, index) => total + Number(digit) * weights[index],
					0,
				);
			const remainder = sum % 11;
			return remainder < 2 ? 0 : 11 - remainder;
		};

		return (
			calculateDigit(value, 12) === Number(value[12]) &&
			calculateDigit(value, 13) === Number(value[13])
		);
	}

	defaultMessage(): string {
		return 'cnpj must contain a valid CNPJ';
	}
}

export class BusinessOnboardingDto {
	@ApiProperty({ example: 'Nome da empresa', maxLength: 150 })
	@IsString()
	@IsNotEmpty()
	@MaxLength(150)
	name: string;

	@ApiProperty({ example: '12345678000195' })
	@Transform(({ value }) => normalizeCnpj(value))
	@IsString()
	@IsNotEmpty()
	@Validate(IsValidCnpjConstraint)
	cnpj: string;

	@ApiProperty({ format: 'uuid' })
	@IsUUID()
	headquarters_city_id: string;

	@ApiPropertyOptional({ type: [String], format: 'uuid' })
	@IsOptional()
	@IsArray()
	@IsUUID(undefined, { each: true })
	branch_city_ids?: string[];
}
