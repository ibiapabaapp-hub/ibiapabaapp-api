import { entity_category, category } from '@prisma/client';

export class Category implements category {
	entities: entity_category[];
	name: string;
	id: string;
	parent_id: string | null;
	created_at: Date;
	updated_at: Date;
}
