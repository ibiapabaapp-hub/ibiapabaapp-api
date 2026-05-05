import { profile_favorite } from '@prisma/client';

export class Favorite implements profile_favorite {
	id: string;
	profile_id: string;
	city_id: string | null;
	event_id: string | null;
	business_profile_id: string | null;
}
