import { account_favorite } from '@prisma/client';

export class Favorite implements account_favorite {
	id: string;
	account_id: string;
	city_id: string | null;
	event_id: string | null;
	business_id: string | null;
}
