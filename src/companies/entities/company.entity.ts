import { Company as CompanyPrisma } from '@prisma/client';

export class Company implements CompanyPrisma {
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
