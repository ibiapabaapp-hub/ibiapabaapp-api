import { Controller, Get, Param } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { City } from './entities/city.entity';
import { MediasService } from 'src/medias/medias.service';

@Controller('cities')
export class CitiesController {
  constructor(
    private readonly citiesService: CitiesService,
    private readonly mediasService: MediasService,
  ) {}

  @ApiOperation({ summary: 'Obtém todas as cidades' })
  @ApiResponse({ status: 200, type: City, isArray: true })
  @Get()
  findAll() {
    return this.citiesService.findAll();
  }

  @ApiOperation({ summary: 'Obtém uma cidade' })
  @ApiResponse({ status: 200, type: City })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.citiesService.findOne(id);
  }

  @Get(':id/media')
  async getCityMedia(@Param('id') id: string) {
    return this.mediasService.getMediaByCity(id);
  }
}
