import { city } from '@prisma/client';

export class City implements city {
	name: string;
	id: string;
	slug: string;
	description: string | null;
	cover_img_url: string | null;
	created_at: Date;
	updated_at: Date;
}
