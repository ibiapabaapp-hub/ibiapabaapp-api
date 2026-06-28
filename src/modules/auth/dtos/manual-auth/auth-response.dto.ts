import { ApiProperty } from '@nestjs/swagger';
import { instanceToPlain } from 'class-transformer';
import { SecureAccountDTO } from 'src/modules/accounts/dtos/secure-account-dto';

export class AuthResponseDto {
	@ApiProperty({ type: SecureAccountDTO })
	account: SecureAccountDTO;

	@ApiProperty({ example: 'eyJhbGciOiJIUzI1...' })
	access_token: string;

	@ApiProperty({ example: 'eyJhbGciOiJIUzI1...' })
	refresh_token: string;

	constructor(partial: any) {
		const account = instanceToPlain(new SecureAccountDTO(partial.account));
		Object.assign(this, { ...partial, account });
	}
}

export class CheckUniqueResponseDto {
	@ApiProperty({ example: 'email' })
	field: string;

	@ApiProperty({ example: 'teste@teste.com' })
	value: string;

	@ApiProperty({ example: true })
	available: boolean;
}
