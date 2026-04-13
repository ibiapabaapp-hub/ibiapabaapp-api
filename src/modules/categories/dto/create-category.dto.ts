import { $Enums, category } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto implements Omit<
	category,
	'id' | 'created_at' | 'updated_at'
> {
	entities: $Enums.CategoryEntity[];
	@IsNotEmpty()
	@IsString()
	name: string;

	parent_id: string | null;
}
