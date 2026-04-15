import { ApiProperty } from "@nestjs/swagger";
import { instanceToPlain } from "class-transformer";
import { SecureAccountDTO } from "src/modules/accounts/dtos/secure-account-dto";

export class AuthResponseDto {
  @ApiProperty({ type: SecureAccountDTO })
  account: SecureAccountDTO;

  @ApiProperty({ example: "eyJhbGciOiJIUzI1..." })
  accessToken: string;

  @ApiProperty({ example: "eyJhbGciOiJIUzI1..." })
  refreshToken: string;

  constructor(partial: any) {
    const account = instanceToPlain(new SecureAccountDTO(partial.account));
    Object.assign(this, { ...partial, account });
  }
}

export class CheckUniqueResponseDto {
  @ApiProperty({ example: "email" })
  field: string;

  @ApiProperty({ example: "teste@teste.com" })
  value: string;

  @ApiProperty({ example: true })
  available: boolean;
}
