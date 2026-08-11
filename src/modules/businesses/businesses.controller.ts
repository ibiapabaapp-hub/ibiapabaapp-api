import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiResponse,
} from '@nestjs/swagger';
import { CurrentAccount } from 'src/modules/common/decorators/current-account.decorator';
import { Public } from 'src/modules/common/decorators/public.decorator';
import { Media } from 'src/modules/medias/entities/media.entity';
import { MediasService } from 'src/modules/medias/medias.service';

import { BusinessesService } from './businesses.service';
import { BusinessOnboardingDto } from './dto/business-onboarding.dto';
import { CreateBusinessDTO } from './dto/create-business.dto';
import { UpdateBusinessDTO } from './dto/update-business.dto';
import { Business } from './entities/business.entity';

@Controller({ path: 'businesses', version: '1' })
export class BusinessesController {
	constructor(
		private readonly businessesService: BusinessesService,
		private readonly mediasService: MediasService,
	) {}

	@ApiBearerAuth()
	@ApiBody({ type: CreateBusinessDTO })
	@ApiOperation({ summary: 'Criar uma nova empresa' })
	@ApiResponse({ status: 201, type: Business })
	@Post()
	create(@Body() createBusinessDto: CreateBusinessDTO) {
		return this.businessesService.create(createBusinessDto);
	}

	@ApiBearerAuth()
	@ApiBody({ type: BusinessOnboardingDto })
	@ApiOperation({ summary: 'Concluir o onboarding de uma empresa' })
	@ApiResponse({ status: 201, description: 'Empresa criada com sucesso' })
	@ApiResponse({ status: 409, description: 'A conta já possui uma empresa' })
	@Post('onboarding')
	onboarding(
		@CurrentAccount('id') accountId: string,
		@Body() dto: BusinessOnboardingDto,
	) {
		return this.businessesService.onboard(accountId, dto);
	}

	@ApiBearerAuth()
	@Public()
	@ApiOperation({ summary: 'Obtém todas as empresas' })
	@ApiResponse({ status: 200, type: Business, isArray: true })
	@Get()
	findAll() {
		return this.businessesService.findAll();
	}

	@ApiBearerAuth()
	@ApiOperation({ summary: 'Buscar uma empresa pelo ID' })
	@ApiParam({ name: 'id', description: 'UUID da empresa' })
	@ApiResponse({ status: 200, type: Business })
	@ApiResponse({ status: 404, description: 'Empresa não encontrada' })
	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.businessesService.findOne(id);
	}

	@ApiBearerAuth()
	@ApiParam({ name: 'id', description: 'UUID da empresa' })
	@ApiBody({ type: UpdateBusinessDTO })
	@ApiOperation({ summary: 'Atualizar dados de uma empresa' })
	@ApiResponse({ status: 200, type: Business })
	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateBusinessDto: UpdateBusinessDTO,
	) {
		return this.businessesService.update(id, updateBusinessDto);
	}

	@ApiBearerAuth()
	@ApiParam({ name: 'id', description: 'UUID da empresa' })
	@ApiOperation({ summary: 'Remover uma empresa' })
	@ApiResponse({ status: 200, description: 'Mensagem de sucesso' })
	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.businessesService.remove(id);
	}

	@ApiBearerAuth()
	@ApiParam({ name: 'id', description: 'UUID da empresa' })
	@ApiOperation({ summary: 'Obtém mídias de uma empresa' })
	@ApiResponse({ status: 200, type: Media, isArray: true })
	@Get(':id/media')
	async getBusinessMedia(@Param('id') id: string) {
		return this.mediasService.getMediaByAccount(id);
	}
}
