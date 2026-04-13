import { $Enums, category } from '@prisma/client';

export class Category implements category {
	entities: $Enums.CategoryEntity[];
	name: string;
	id: string;
	parent_id: string | null;
	created_at: Date;
	updated_at: Date;
}
