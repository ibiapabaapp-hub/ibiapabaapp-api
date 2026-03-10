import { Company } from '@prisma/client';

export class CreateCompanyDto implements Company {
  name: string;
  id: string;
  slug: string;
  cnpj: string | null;
  cover_img_url: string | null;
  description: string | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}
