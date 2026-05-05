import { $Enums } from '@prisma/client';

export class CreateBusinessDTO {
	account_id: string;
	max_reach_level: $Enums.reach_level;
	id: string;
	slug: string;
	cnpj: string | null;
	cover_img_url: string | null;
	description: string | null;
	active: boolean;
	created_at: Date;
	updated_at: Date;
}
