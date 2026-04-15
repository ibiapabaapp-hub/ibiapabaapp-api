import { business, reach_level } from '@prisma/client';

export class Business implements business {
	id: string;
	profile_id: string;
	max_reach_level: reach_level;
	cnpj: string | null;
	created_at: Date;
	updated_at: Date;
}
