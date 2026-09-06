import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsBoolean,
	IsNumber,
	IsOptional,
	IsString,
	IsUrl,
	MaxLength,
	Min,
} from 'class-validator';

export class CreateBusinessServiceDto {
	@ApiProperty() @IsString() @MaxLength(150) name: string;
	@ApiPropertyOptional() @IsOptional() @IsString() description?: string;
	@ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) price_from?: number;
	@ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) price_to?: number;
	@ApiPropertyOptional() @IsOptional() @IsString() price_label?: string;
	@ApiPropertyOptional()
	@IsOptional()
	@IsUrl({ require_tld: false })
	booking_url?: string;
	@ApiPropertyOptional() @IsOptional() @IsString() service_type?: string;
	@ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) position?: number;
	@ApiPropertyOptional() @IsOptional() @IsBoolean() active?: boolean;
}
export class UpdateBusinessServiceDto extends CreateBusinessServiceDto {}
