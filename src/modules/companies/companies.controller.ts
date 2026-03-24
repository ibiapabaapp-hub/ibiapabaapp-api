import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { MediasService } from 'src/modules/medias/medias.service';

import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Media } from 'src/modules/medias/entities/media.entity';
import { Company } from './entities/company.entity';

@Controller({ path: 'companies', version: '1' })
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly mediasService: MediasService,
  ) {}

  @ApiBearerAuth()
  @ApiBody({ type: CreateCompanyDto })
  @ApiOperation({ summary: 'Criar uma nova empresa' })
  @ApiResponse({ status: 201, type: Company })
  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtém todas as empresas' })
  @ApiResponse({ status: 200, type: Company, isArray: true })
  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar uma empresa pelo ID' })
  @ApiParam({ name: 'id', description: 'UUID da empresa' })
  @ApiResponse({ status: 200, type: Company })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID da empresa' })
  @ApiBody({ type: UpdateCompanyDto })
  @ApiOperation({ summary: 'Atualizar dados de uma empresa' })
  @ApiResponse({ status: 200, type: Company })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID da empresa' })
  @ApiOperation({ summary: 'Remover uma empresa' })
  @ApiResponse({ status: 200, description: 'Mensagem de sucesso' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }

  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID da empresa' })
  @ApiOperation({ summary: 'Obtém mídias de uma empresa' })
  @ApiResponse({ status: 200, type: Media, isArray: true })
  @Get(':id/media')
  async getCompanyMedia(@Param('id') id: string) {
    return this.mediasService.getMediaByCompany(id);
  }
}
