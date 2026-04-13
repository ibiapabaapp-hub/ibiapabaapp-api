import { ApiProperty } from '@nestjs/swagger';
import { City } from 'src/modules/cities/entities/city.entity';
import { Company } from 'src/modules/companies/entities/company.entity';
import { Event } from 'src/modules/events/entities/event.entity';

export class SearchResponseDto {
	@ApiProperty({ type: [City] })
	cities: City[];

	@ApiProperty({ type: [Company] })
	companies: Company[];

	@ApiProperty({ type: [Event] })
	events: Event[];
}
