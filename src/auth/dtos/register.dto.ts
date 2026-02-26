import { user_role } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsString,
  Matches,
  MaxDate,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @MaxLength(100)
  @IsString()
  name: string;

  @MaxLength(50)
  @MinLength(4)
  @IsString()
  username: string;

  // @IsString()
  // @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}/)
  // cpf: string;

  @IsString()
  @MaxLength(254)
  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/) // E.164 format
  phone_number: string;

  @IsDate()
  @MaxDate(new Date())
  @Type(() => Date)
  birth_date: Date;

  @IsEnum(user_role)
  role: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(8)
  password_confirm: string;
}
