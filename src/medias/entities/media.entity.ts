import { $Enums, Media as MediaPrisma } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/client';

export class Media implements MediaPrisma {
  id: string;
  entity_type: $Enums.EntityType;
  entity_id: string;
  media_type: $Enums.MediaType;
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
