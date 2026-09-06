import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ReviewAccountDto {
	@ApiProperty({ format: 'uuid' })
	id: string;

	@ApiProperty()
	display_name: string;

	@ApiPropertyOptional({ nullable: true })
	avatar_url: string | null;
}

export class ReviewResponseDto {
	@ApiProperty({ format: 'uuid' })
	id: string;

	@ApiProperty({ format: 'uuid' })
	account_id: string;

	@ApiPropertyOptional({ format: 'uuid', nullable: true })
	business_id: string | null;

	@ApiPropertyOptional({ format: 'uuid', nullable: true })
	event_id: string | null;

	@ApiProperty({ minimum: 1, maximum: 5 })
	rating: number;

	@ApiPropertyOptional({ maxLength: 300, nullable: true })
	comment: string | null;

	@ApiProperty({ type: String, format: 'date-time' })
	created_at: Date;

	@ApiProperty({ type: String, format: 'date-time' })
	updated_at: Date;

	@ApiProperty({ type: ReviewAccountDto })
	account: ReviewAccountDto;
}
