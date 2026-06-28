import { event_type, reach_level } from '@prisma/client';

export class Event {
	id: string;
	owner_account_id: string;

	name: string;
	slug: string;
	description: string | null;
	cover_img_url: string | null;

	type: event_type;
	active: boolean;
	reach_level: reach_level;

	start_date: Date;
	end_date: Date;
	created_at: Date;
	updated_at: Date;
}
