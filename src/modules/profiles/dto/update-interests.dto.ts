import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsUUID, ValidateNested } from 'class-validator';

export class CategoryInterestInputDTO {
	@ApiProperty({ description: 'ID da categoria de interesse', example: 'uuid' })
	@IsUUID()
	category_id: string;
}

export class UpdateInterestsDTO {
	@ApiProperty({
		description: 'Lista de categorias de interesse',
		type: [CategoryInterestInputDTO],
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CategoryInterestInputDTO)
	interests: CategoryInterestInputDTO[];
}
