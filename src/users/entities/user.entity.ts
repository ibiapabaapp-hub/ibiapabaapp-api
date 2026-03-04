import { $Enums, User as UserPrisma } from '@prisma/client';
export class User implements UserPrisma {
  name: string;
  id: string;
  birth_date: Date;
  username: string;
  email: string;
  phone_number: string;
  password: string;
  role: $Enums.UserRole;
  active: boolean;
  created_at: Date | null;
  updated_at: Date | null;
}
