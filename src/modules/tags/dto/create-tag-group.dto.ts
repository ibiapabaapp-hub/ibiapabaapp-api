import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTagGroupDto {
	@IsNotEmpty()
	@IsString()
	name: string;

	@IsOptional()
	@IsString()
	description?: string;
}
