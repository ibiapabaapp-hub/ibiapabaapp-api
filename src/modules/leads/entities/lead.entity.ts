import { $Enums, lead } from '@prisma/client';

export class Lead implements lead {
	name: string;
	id: string;
	email: string;
	phone_number: string;
	type: $Enums.lead_type;
	company_name: string | null;
	created_at: Date | null;
	updated_at: Date | null;
}
