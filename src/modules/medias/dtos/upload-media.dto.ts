import { IsString } from 'class-validator';

export class UploadMediaDto {
	@IsString()
	folder?: string;
}
