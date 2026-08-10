import { Controller, Get, Param } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
} from '@nestjs/swagger';
import { Public } from 'src/modules/common/decorators/public.decorator';
import { Media } from 'src/modules/medias/entities/media.entity';
import { MediasService } from 'src/modules/medias/medias.service';

import { CitiesService } from './cities.service';
import { City } from './entities/city.entity';

@Controller({ path: 'cities', version: '1' })
export class CitiesController {
	constructor(
		private readonly citiesService: CitiesService,
		private readonly mediasService: MediasService,
	) {}

	@ApiBearerAuth()
	@Public()
	@ApiOperation({ summary: 'Obtém todas as cidades' })
	@ApiResponse({ status: 200, type: City, isArray: true })
	@Get()
	findAll(): Promise<City[]> {
		return this.citiesService.findAll();
	}

	@ApiBearerAuth()
	@Public()
	@ApiParam({ name: 'id', description: 'UUID da cidade' })
	@ApiOperation({ summary: 'Obtém uma cidade' })
	@ApiResponse({ status: 200, type: City })
	@Get(':id')
	findOne(@Param('id') id: string): Promise<City> {
		return this.citiesService.findOne(id);
	}

	@ApiBearerAuth()
	@ApiParam({ name: 'id', description: 'UUID da cidade' })
	@ApiOperation({ summary: 'Obtém mídias de uma cidade' })
	@ApiResponse({ status: 200, type: Media, isArray: true })
	@Get(':id/media')
	async getCityMedia(@Param('id') id: string): Promise<Media[]> {
		return this.mediasService.getMediaByCity(id);
	}
}
