import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class UpdateReviewDto {
	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(5)
	rating?: number;

	@IsOptional()
	comment?: string;
}
