import { user_role } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsString,
  IsDate,
  MaxDate,
  IsEmail,
  MinLength,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsDate()
  @MaxDate(new Date())
  @Type(() => Date)
  @IsOptional()
  birth_date?: Date;

  @IsEnum(user_role)
  @IsOptional()
  role?: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
