import { ApiProperty } from '@nestjs/swagger';
import { company_role } from '@prisma/client';
import { IsEnum, IsUUID } from 'class-validator';

export class AddUserToCompanyDto {
	@ApiProperty({ type: String, description: 'UUID do usuario' })
	@IsUUID()
	user_id: string;

	@ApiProperty({ type: String, description: 'UUID da empresa' })
	@IsUUID()
	company_id: string;

	@ApiProperty({ enum: company_role, example: 'OWNER' })
	@IsEnum(company_role)
	role: company_role;
}
