import { account, account_type } from '@prisma/client';

export class Account implements account {
	id: string;
	name: string;
	is_verified: boolean;
	// birth_date: Date;
	// username: string;
	email: string;
	phone_number: string;
	password: string;
	active: boolean;
	created_at: Date;
	updated_at: Date;

	// Merged profile fields
	slug: string;
	display_name: string;
	bio: string | null;
	avatar_url: string | null;
	type: account_type;
}
