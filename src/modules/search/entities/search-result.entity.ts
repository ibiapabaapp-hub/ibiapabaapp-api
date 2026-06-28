import { ApiProperty } from '@nestjs/swagger';

export class SearchResponseDto {
	@ApiProperty({ type: [Object] })
	cities: any[];

	@ApiProperty({ type: [Object] })
	businesses: any[];

	@ApiProperty({ type: [Object] })
	events: any[];
}
