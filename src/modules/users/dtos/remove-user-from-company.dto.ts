import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class RemoveUserFromCompanyDto {
	@ApiProperty({ type: String, description: 'UUID do usuario' })
	@IsUUID()
	user_id: string;

	@ApiProperty({ type: String, description: 'UUID da empresa' })
	@IsUUID()
	company_id: string;
}
