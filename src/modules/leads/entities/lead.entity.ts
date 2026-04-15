import { lead, lead_type } from '@prisma/client';

export class Lead implements lead {
	id: string;
	name: string;
	email: string;
	phone_number: string;
	business_name: string | null;
	type: lead_type;
	created_at: Date;
	updated_at: Date;
}
