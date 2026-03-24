import { Controller, Get, Param } from '@nestjs/common';
import { CitiesService } from './cities.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { City } from './entities/city.entity';
import { MediasService } from 'src/modules/medias/medias.service';
import { Media } from 'src/modules/medias/entities/media.entity';

@Controller({ path: 'cities', version: '1' })
export class CitiesController {
  constructor(
    private readonly citiesService: CitiesService,
    private readonly mediasService: MediasService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtém todas as cidades' })
  @ApiResponse({ status: 200, type: City, isArray: true })
  @Get()
  findAll(): Promise<City[]> {
    return this.citiesService.findAll();
  }

  @ApiBearerAuth()
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
