import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthDto {
	@IsString()
	@IsNotEmpty()
	id_token: string;
}
