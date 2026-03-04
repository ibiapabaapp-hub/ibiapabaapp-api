import { $Enums, users } from '@prisma/client';
export class User implements users {
  name: string;
  id: string;
  birth_date: Date;
  username: string;
  email: string;
  phone_number: string;
  password: string;
  role: $Enums.user_role;
  active: boolean;
  created_at: Date | null;
  updated_at: Date | null;
}
