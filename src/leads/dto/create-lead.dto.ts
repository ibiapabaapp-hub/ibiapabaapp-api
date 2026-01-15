import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateLeadDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(50)
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['resident', 'tourist', 'company'])
  @MinLength(4)
  @MaxLength(10)
  type: string;

  @ValidateIf(
    (o: { type: 'resident' | 'tourist' | 'company' }) => o.type === 'company',
  )
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(50)
  company_name?: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\(\d{2}\)\s\d\s\d{4}-\d{4}$/)
  phone_number: string;
}
