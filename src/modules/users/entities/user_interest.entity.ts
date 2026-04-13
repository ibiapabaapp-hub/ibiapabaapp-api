import { user_interest } from '@prisma/client';

export class UserInterest implements user_interest {
	id: string;
	user_id: string;
	category_id: string;
	created_at: Date;
}

export class InterestsCount {
	count: number;
}

export class UserInterestsResponse {
	companies_ids: string[];
	events_ids: string[];
}
