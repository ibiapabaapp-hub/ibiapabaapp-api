import { $Enums, category, entity_category } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto implements Omit<
	category,
	'id' | 'created_at' | 'updated_at'
> {
	entities: entity_category[];
	@IsNotEmpty()
	@IsString()
	name: string;

	parent_id: string | null;
}
