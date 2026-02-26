import {
  IsEmail,
  IsIn,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { UNIQUE_USER_FIELDS, type UniqueUserField } from './unique-user-fields';

export class CheckUniqueDto {
  @IsIn(UNIQUE_USER_FIELDS)
  field: UniqueUserField;

  @IsString()
  @MaxLength(254)
  @ValidateIf((o: CheckUniqueDto) => o.field === 'email')
  @IsEmail()
  @ValidateIf((o: CheckUniqueDto) => o.field === 'phone_number')
  @Matches(/^\+[1-9]\d{1,14}$/)
  value: string;
}

export type CheckUniqueResponse = {
  field: UniqueUserField;
  value: string;
  available: boolean;
};
