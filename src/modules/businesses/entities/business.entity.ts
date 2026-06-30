import { reach_level } from '@prisma/client';

export class Business {
	id: string;
	account_id: string;
	max_reach_level: reach_level;
	cnpj: string | null;
	created_at: Date;
	updated_at: Date;
}
