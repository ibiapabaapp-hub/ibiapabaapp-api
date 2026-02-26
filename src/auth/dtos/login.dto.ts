import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MaxLength(254)
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
