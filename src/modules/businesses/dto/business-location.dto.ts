import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsBoolean,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	Min,
} from 'class-validator';

export class CreateBusinessLocationDto {
	@ApiProperty({ format: 'uuid' }) @IsUUID() city_id: string;
	@ApiPropertyOptional() @IsOptional() @IsBoolean() is_headquarter?: boolean;
	@ApiPropertyOptional() @IsOptional() @IsString() address?: string;
	@ApiPropertyOptional() @IsOptional() @IsString() neighborhood?: string;
	@ApiPropertyOptional() @IsOptional() @IsString() postal_code?: string;
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	@Min(-90)
	@Max(90)
	latitude?: number;
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	@Min(-180)
	@Max(180)
	longitude?: number;
	@ApiPropertyOptional() @IsOptional() @IsString() map_url?: string;
}

export class UpdateBusinessLocationDto extends CreateBusinessLocationDto {}
