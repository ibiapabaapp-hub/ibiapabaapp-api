import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { MaxLength } from 'class-validator';

export class UpdateReviewDto {
	@ApiPropertyOptional({ minimum: 1, maximum: 5, type: Number })
	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(5)
	rating?: number;

	@ApiPropertyOptional({ maxLength: 300 })
	@IsOptional()
	@MaxLength(300)
	comment?: string;
}
