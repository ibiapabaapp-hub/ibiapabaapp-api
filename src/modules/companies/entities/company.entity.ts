import { $Enums, company } from '@prisma/client';

export class Company implements company {
  max_reach_level: $Enums.reach_level;
  name: string;
  id: string;
  slug: string;
  cnpj: string | null;
  description: string | null;
  cover_img_url: string | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}
