import { Prisma } from '@prisma/client';

export type Lead = Prisma.leadsGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    type: true;
    company_name?: true;
    phone_number: true;
    created_at: true;
    updated_at: true;
  };
}>;
