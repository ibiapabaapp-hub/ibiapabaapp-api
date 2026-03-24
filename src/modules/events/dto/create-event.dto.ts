import { ApiProperty } from '@nestjs/swagger';
import { event_type, reach_level } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    example: 'uuidv4',
    type: String,
  })
  @IsUUID('4')
  @ValidateIf((o: { user_id?: string }) => o.user_id === undefined)
  company_id: string | null;

  @ApiProperty({
    example: 'uuidv4',
    type: String,
  })
  @IsUUID('4')
  @ValidateIf((o: { company_id?: string }) => o.company_id === undefined)
  user_id: string | null;

  @ApiProperty({
    example: 'Evento Importante',
    minLength: 4,
    maxLength: 200,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(200)
  name: string;

  @ApiProperty({
    example: 'Descrição do evento',
    maxLength: 300,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  cover_img_url?: string;

  @ApiProperty({
    example: 'evento-importante',
    minLength: 4,
    maxLength: 100,
    type: String,
  })
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    example: 'simple',
    enum: ['simple', 'featured'],
    description: 'Tipo de evento categorizado',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['simple', 'featured'])
  type: event_type;

  @ApiProperty({ example: { active: true }, type: Boolean })
  @IsBoolean()
  active: boolean;

  @ApiProperty({
    example: 'local',
    enum: ['local', 'regional'],
    description: 'Alcance do evento',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['local', 'regional'])
  reach_level: reach_level;

  @IsDateString()
  @IsISO8601()
  start_date: Date;

  @IsDateString()
  @IsISO8601()
  end_date: Date;
}
