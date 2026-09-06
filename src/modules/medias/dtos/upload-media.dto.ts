import { media_type } from '@prisma/client';
import {
	IsBoolean,
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
	MaxLength,
	Min,
} from 'class-validator';

export class UploadMediaDto {
	@IsOptional() @IsEnum(media_type) media_type?: media_type;
	@IsOptional() @IsBoolean() is_cover?: boolean;
	@IsOptional() @IsString() alt_text?: string;
	@IsOptional() @IsString() @MaxLength(500) thumbnail_url?: string;
	@IsOptional() @IsInt() @Min(0) position?: number;
	@IsOptional() @IsString() folder?: string;
}

export class UpdateBusinessMediaDto {
	@IsOptional() @IsBoolean() is_cover?: boolean;
	@IsOptional() @IsInt() @Min(0) position?: number;
	@IsOptional() @IsString() alt_text?: string;
	@IsOptional() @IsString() @MaxLength(500) thumbnail_url?: string;
}

export class ReorderBusinessMediaDto {
	@IsString({ each: true }) media_ids: string[];
}
