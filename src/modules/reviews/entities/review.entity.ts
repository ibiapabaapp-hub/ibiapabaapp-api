export class Review {
	id: string;
	account_id: string;
	business_id?: string;
	event_id?: string;
	rating: number;
	comment?: string;
	created_at: Date;
	updated_at: Date;
}
