import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDTO {
	@ApiProperty({ name: 'success', type: Boolean, example: true })
	success: boolean;
}
