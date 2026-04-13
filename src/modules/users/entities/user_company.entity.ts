import { company_role, user_company } from '@prisma/client';

export class UserCompany implements user_company {
	id: string;
	user_id: string;
	company_id: string;
	role: company_role;
	created_at: Date;
	updated_at: Date;
}
