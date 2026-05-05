import { review } from "@prisma/client";

export class Review implements review {
	id: string;
	account_id: string;
	business_id: string | null;
	event_id: string | null;
	rating: number;
	comment: string | null;
	created_at: Date;
	updated_at: Date;
}
