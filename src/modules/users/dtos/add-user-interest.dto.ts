import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class AddUserInterestDto {
	@IsArray()
	@IsUUID('4', { each: true })
	@IsOptional()
	companies_ids?: string[];

	@IsArray()
	@IsUUID('4', { each: true })
	@IsOptional()
	events_ids?: string[];
}
