import { ApiProperty } from '@nestjs/swagger';
import { City } from 'src/modules/cities/entities/city.entity';
import { Business } from 'src/modules/businesses/entities/business.entity';
import { Event } from 'src/modules/events/entities/event.entity';

export class SearchResponseDto {
	@ApiProperty({ type: [City] })
	cities: City[];

	@ApiProperty({ type: [Business] })
	businesses: Business[];

	@ApiProperty({ type: [Event] })
	events: Event[];
}
