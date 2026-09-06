import { ApiPropertyOptional } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import {
	IsBoolean,
	IsEnum,
	IsOptional,
	IsString,
	MaxLength,
} from 'class-validator';

export class UpdateBusinessProfileDto {
	@ApiPropertyOptional({ maxLength: 150 })
	@IsOptional()
	@IsString()
	@MaxLength(150)
	commercial_name?: string;
	@ApiPropertyOptional() @IsOptional() @IsString() bio?: string;
	@ApiPropertyOptional() @IsOptional() @IsString() description?: string;
	@ApiPropertyOptional() @IsOptional() @IsString() cnpj?: string;
	@ApiPropertyOptional({ enum: $Enums.reach_level })
	@IsOptional()
	@IsEnum($Enums.reach_level)
	max_reach_level?: $Enums.reach_level;
	@ApiPropertyOptional() @IsOptional() @IsBoolean() accepts_payment?: boolean;
	@ApiPropertyOptional() @IsOptional() @IsBoolean() offers_delivery?: boolean;
	@ApiPropertyOptional() @IsOptional() @IsBoolean() in_person_service?: boolean;
	@ApiPropertyOptional() @IsOptional() @IsBoolean() accessibility?: boolean;
	@ApiPropertyOptional() @IsOptional() @IsBoolean() parking?: boolean;
	@ApiPropertyOptional() @IsOptional() @IsBoolean() wifi?: boolean;
}

export class UpdateBusinessContactDto {
	@ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
	@ApiPropertyOptional() @IsOptional() @IsString() whatsapp?: string;
	@ApiPropertyOptional() @IsOptional() @IsString() public_email?: string;
	@ApiPropertyOptional() @IsOptional() @IsString() website?: string;
	@ApiPropertyOptional() @IsOptional() @IsString() instagram?: string;
	@ApiPropertyOptional() @IsOptional() @IsString() facebook?: string;
}
