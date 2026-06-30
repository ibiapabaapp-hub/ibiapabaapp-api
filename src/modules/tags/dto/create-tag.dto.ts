import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTagDto {
	@IsNotEmpty()
	@IsString()
	name: string;

	@IsNotEmpty()
	@IsString()
	group_id: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsString()
	color?: string;

	@IsOptional()
	@IsInt()
	position?: number;
}
