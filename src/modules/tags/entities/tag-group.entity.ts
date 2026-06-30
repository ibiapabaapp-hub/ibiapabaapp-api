import { tag_group } from '@prisma/client';

export class TagGroup implements tag_group {
	id: string;
	name: string;
	description: string | null;
	created_at: Date;
	updated_at: Date;
}
