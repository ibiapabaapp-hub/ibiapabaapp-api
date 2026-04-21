import { business, reach_level } from '@prisma/client';
import { Category } from 'src/modules/categories/entities/category.entity';

export class Business implements business {
	id: string;
	profile_id: string;
	max_reach_level: reach_level;
	cnpj: string | null;
	categories?: Category[] | null;
	created_at: Date;
	updated_at: Date;
}
