import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class AddInterestsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  category_ids: string[];
}
