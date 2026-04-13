import { $Enums, media } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/client';

export class Media implements media {
	id: string;
	city_id: string | null;
	event_id: string | null;
	company_id: string | null;

	media_type: $Enums.media_type;
	url: string;
	thumbnail_url: string | null;

	alt_text: string | null;
	credits: string | null;
	license: string | null;
	is_cover: boolean;
	position: number;

	metadata: JsonValue;
	created_at: Date;
}
