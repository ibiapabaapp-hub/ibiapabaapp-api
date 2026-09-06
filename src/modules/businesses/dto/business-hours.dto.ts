import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsBoolean,
	IsDateString,
	IsInt,
	IsOptional,
	IsString,
	IsUUID,
	Matches,
	Max,
	Min,
} from 'class-validator';

const time = /^([01]\d|2[0-3]):[0-5]\d$/;
export class BusinessHourDto {
	@ApiProperty({ minimum: 0, maximum: 6 })
	@IsInt()
	@Min(0)
	@Max(6)
	weekday: number;
	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	business_city_id?: string;
	@ApiPropertyOptional() @IsOptional() @IsBoolean() is_closed?: boolean;
	@ApiPropertyOptional({ example: '08:00' })
	@IsOptional()
	@Matches(time)
	opens_at?: string;
	@ApiPropertyOptional({ example: '18:00' })
	@IsOptional()
	@Matches(time)
	closes_at?: string;
	@ApiPropertyOptional() @IsOptional() @Matches(time) break_start?: string;
	@ApiPropertyOptional() @IsOptional() @Matches(time) break_end?: string;
}
export class UpdateBusinessHoursDto {
	@ApiProperty({ type: [BusinessHourDto] }) hours: BusinessHourDto[];
}
export class BusinessHourExceptionDto {
	@ApiProperty() @IsDateString() date: string;
	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	business_city_id?: string;
	@ApiPropertyOptional() @IsOptional() @IsBoolean() is_closed?: boolean;
	@ApiPropertyOptional() @IsOptional() @Matches(time) opens_at?: string;
	@ApiPropertyOptional() @IsOptional() @Matches(time) closes_at?: string;
	@ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
}
