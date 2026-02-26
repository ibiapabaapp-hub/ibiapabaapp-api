import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;

  @Transform(({ value }) => {
    if (value === 'false') return false;
    if (value === 'true') return true;
    return Boolean(value);
  })
  @IsBoolean()
  @IsOptional()
  all?: string;
}
