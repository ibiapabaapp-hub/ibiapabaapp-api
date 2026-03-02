import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { Public } from 'src/common/decorators/public.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { LeadResponseDto } from './dto/lead-response.dto';

@Controller({ path: 'leads', version: '1' })
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @ApiOperation({ summary: 'Criar um novo lead publicamente' })
  @ApiResponse({ status: 201, type: LeadResponseDto })
  @ApiResponse({
    status: 400,
    description: 'Lead já existe ou dados inválidos',
  })
  @Post()
  @Public()
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os leads' })
  @ApiResponse({ status: 200, type: [LeadResponseDto] })
  @Get()
  findAll() {
    return this.leadsService.findAll();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar um lead pelo ID' })
  @ApiParam({ name: 'id', description: 'UUID do lead' })
  @ApiResponse({ status: 200, type: LeadResponseDto })
  @ApiResponse({ status: 404, description: 'Lead não encontrado' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar dados de um lead' })
  @ApiResponse({ status: 200, type: LeadResponseDto })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover um lead' })
  @ApiResponse({ status: 200, description: 'Mensagem de sucesso' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
