import {
  IsEmail,
  IsIn,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { UNIQUE_USER_FIELDS, type UniqueUserField } from './unique-user-fields';
import { ApiProperty } from '@nestjs/swagger';

export class CheckUniqueDto {
  @ApiProperty({
    name: 'field',
    description: 'Nome do campo único a ser checado',
    example: 'email',
  })
  @IsIn(UNIQUE_USER_FIELDS)
  field: UniqueUserField;

  @ApiProperty({
    name: 'value',
    description: 'Valor do campo único a ser checado',
    example: 'mail@example.com',
  })
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
