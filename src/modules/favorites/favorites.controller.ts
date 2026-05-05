import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Query,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiResponse,
} from '@nestjs/swagger';

import { CreateFavoriteDTO } from './dto/create-favorite.dto';
import { Favorite } from './entities/favorite.entity';
import { FavoritesService } from './favorites.service';

@Controller({ path: 'favorites', version: '1' })
export class FavoritesController {
	constructor(private readonly favoritesService: FavoritesService) {}

	@ApiBearerAuth()
	@ApiBody({ type: CreateFavoriteDTO })
	@ApiOperation({ summary: 'Adicionar um item aos favoritos de um perfil' })
	@ApiResponse({ status: 201, type: Favorite })
	@ApiResponse({ status: 409, description: 'Item já favoritado' })
	@Post()
	create(@Body() createFavoriteDto: CreateFavoriteDTO) {
		return this.favoritesService.create(createFavoriteDto);
	}

	@ApiBearerAuth()
	@ApiOperation({ summary: 'Listar todos os favoritos' })
	@ApiResponse({ status: 200, type: Favorite, isArray: true })
	@Get()
	findAll(@Query('account_id') accountId?: string) {
		return this.favoritesService.findAll(accountId);
	}

	@ApiBearerAuth()
	@ApiOperation({ summary: 'Buscar um favorito pelo ID' })
	@ApiParam({ name: 'id', description: 'UUID do favorito' })
	@ApiResponse({ status: 200, type: Favorite })
	@ApiResponse({ status: 404, description: 'Favorito não encontrado' })
	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.favoritesService.findOne(id);
	}

	@ApiBearerAuth()
	@ApiOperation({ summary: 'Remover um favorito pelo ID' })
	@ApiParam({ name: 'id', description: 'UUID do favorito' })
	@ApiResponse({ status: 200, description: 'Favorito removido com sucesso' })
	@ApiResponse({ status: 404, description: 'Favorito não encontrado' })
	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.favoritesService.remove(id);
	}
}
