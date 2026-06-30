import { tag } from '@prisma/client';

export class Tag implements tag {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	color: string | null;
	group_id: string;
	position: number;
	created_at: Date;
	updated_at: Date;
}
