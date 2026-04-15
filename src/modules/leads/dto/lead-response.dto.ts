import { ApiProperty } from '@nestjs/swagger';

export class LeadResponseDto {
	@ApiProperty({ example: 'uuid-v4-123' })
	id: string;

	@ApiProperty({ example: 'Bruno Oliveira' })
	name: string;

	@ApiProperty({ example: 'bruno@email.com' })
	email: string;

	@ApiProperty({ example: 'business' })
	type: string;

	@ApiProperty({ example: 'Tech Solutions Ltda', nullable: true })
	business_name: string | null;

	@ApiProperty({ example: '(11) 9 9999-8888' })
	phone_number: string;

	@ApiProperty({ type: Date, nullable: true })
	created_at: Date | null;

	@ApiProperty({ type: Date, nullable: true })
	updated_at: Date | null;
}
