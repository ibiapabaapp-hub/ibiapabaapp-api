import { IsNotEmpty, IsOptional, IsInt, IsUUID, Min, Max } from 'class-validator';

export class CreateReviewDto {
	@IsUUID()
	account_id: string;

	@IsOptional()
	@IsUUID()
	business_id?: string;

	@IsOptional()
	@IsUUID()
	event_id?: string;

	@IsInt()
	@Min(1)
	@Max(5)
	rating: number;

	@IsOptional()
	comment?: string;
}
