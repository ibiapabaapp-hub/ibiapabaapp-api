import { account } from '@prisma/client';

export class Account implements account {
	id: string;
	name: string;
	// birth_date: Date;
	// username: string;
	email: string;
	phone_number: string;
	password: string;
	active: boolean;
	created_at: Date;
	updated_at: Date;
}
