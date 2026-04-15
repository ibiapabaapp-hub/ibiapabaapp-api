import { $Enums, media } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/client';

export class Media implements media {
	profile_id: string | null;
	id: string;
	city_id: string | null;
	event_id: string | null;

	media_type: $Enums.media_type;
	url: string;
	thumbnail_url: string | null;

	alt_text?: string;
	credits?: string;
	license?: string;
	is_cover: boolean = false;
	position: number = 0;

	metadata?: JsonValue;
	created_at: Date;
}
