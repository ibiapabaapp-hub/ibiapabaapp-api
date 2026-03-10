import { City as CityPrisma } from '@prisma/client';
export class City implements CityPrisma {
  name: string;
  id: string;
  slug: string;
  description: string | null;
  cover_img_url: string | null;
  created_at: Date;
  updated_at: Date;
}
