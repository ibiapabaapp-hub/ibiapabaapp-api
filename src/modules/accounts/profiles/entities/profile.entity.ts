import { profile_type } from '@prisma/client';

export class Profile {
	id: string;
	slug: string;
	display_name: string;
	bio?: string;
	avatar_url?: string;
	type: profile_type;
	created_at: Date;
	updated_at: Date;
}
