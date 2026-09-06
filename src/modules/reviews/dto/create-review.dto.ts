import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsOptional,
	IsInt,
	IsUUID,
	Min,
	Max,
	MaxLength,
} from 'class-validator';

export class CreateReviewDto {
	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	business_id?: string;

	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	event_id?: string;

	@ApiProperty({ minimum: 1, maximum: 5, type: Number })
	@IsInt()
	@Min(1)
	@Max(5)
	rating: number;

	@ApiPropertyOptional({ maxLength: 300 })
	@IsOptional()
	@MaxLength(300)
	comment?: string;
}
