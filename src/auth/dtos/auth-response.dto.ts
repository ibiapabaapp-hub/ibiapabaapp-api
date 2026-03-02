import { ApiProperty } from '@nestjs/swagger';
import { user_role } from '@prisma/client';

export class UserResponse {
  @ApiProperty({ example: 'uuid-v4-a1b2' })
  id: string;

  @ApiProperty({ example: 'João Silva' })
  name: string;

  @ApiProperty({ example: 'joaosilva' })
  username: string;

  @ApiProperty({ example: 'joao@email.com' })
  email: string;

  @ApiProperty({ example: 'user', enum: user_role })
  role: user_role;

  @ApiProperty({
    description: 'Data de nascimento',
    example: '2000-01-01T00:00:00.000Z',
  })
  birth_date: Date;

  @ApiProperty({ example: '+5511999998888' })
  phone_number: string;

  @ApiProperty({ example: true })
  active: boolean;

  @ApiProperty({
    example: '2023-01-01T10:00:00.000Z',
    nullable: true,
    type: Date,
  })
  created_at: Date | null;

  @ApiProperty({
    example: '2023-01-01T12:00:00.000Z',
    nullable: true,
    type: Date,
  })
  updated_at: Date | null;
}

export class AuthResponseDto {
  @ApiProperty({ type: UserResponse })
  user: UserResponse;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1...' })
  refreshToken: string;
}

export class CheckUniqueResponseDto {
  @ApiProperty({ example: 'email' })
  field: string;

  @ApiProperty({ example: 'teste@teste.com' })
  value: string;

  @ApiProperty({ example: true })
  available: boolean;
}
