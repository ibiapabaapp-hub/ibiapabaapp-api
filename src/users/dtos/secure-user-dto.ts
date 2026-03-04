import { $Enums } from '@prisma/client';

export class SecureUserDto {
  // sem password
  id: string;
  username: string;
  email: string;
  phone_number: string;
  name: string;
  birth_date: Date;
  role: $Enums.UserRole;
  active: boolean;
  created_at: Date | null;
  updated_at: Date | null;
}
