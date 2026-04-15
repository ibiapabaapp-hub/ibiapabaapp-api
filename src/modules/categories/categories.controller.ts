import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseEnumPipe,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
} from '@nestjs/swagger';
import { Public } from 'src/modules/common/decorators/public.decorator';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { entity_category } from '@prisma/client';

@Controller({ path: 'categories', version: '1' })
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) {}

	@ApiOperation({ summary: 'Obtém todas as categorias-pai' })
	@ApiResponse({ status: 200, type: Category, isArray: true })
	@ApiQuery({
		name: 'entity',
		enum: entity_category,
		required: false,
		description: 'Entidade das categorias a serem obtidas',
	})
	@Public()
	@Get('/parents')
	getParents(
		@Query('entity', new ParseEnumPipe(entity_category, { optional: true }))
		entity?: entity_category,
	) {
		return this.categoriesService.findParents(entity);
	}

	@ApiOperation({
		summary:
			'Obtém todas as categorias-filhas de uma categoria pai por uuid',
	})
	@ApiParam({
		name: 'id',
		description: 'UUID da categoria-pai',
		required: true,
	})
	@ApiQuery({
		name: 'entity',
		enum: entity_category,
		required: false,
		description: 'Entidade das categorias a serem obtidas',
	})
	@ApiResponse({ status: 200, type: Category, isArray: true })
	@Public()
	@Get('/parents/:id/children')
	getChildren(
		@Param('id') id: string,
		@Query('entity', new ParseEnumPipe(entity_category, { optional: true }))
		entity?: entity_category,
	) {
		return this.categoriesService.findChildren(id, entity);
	}

	@ApiBearerAuth()
	@ApiOperation({ summary: 'Cria categoria' })
	@ApiBody({ type: CreateCategoryDto, required: true })
	@ApiResponse({ status: 201, type: Category })
	@Post()
	create(@Body() createCategoryDto: CreateCategoryDto) {
		return this.categoriesService.create(createCategoryDto);
	}

	@ApiOperation({ summary: 'Obtém uma categoria' })
	@ApiParam({ name: 'id', description: 'UUID da categoria', required: true })
	@ApiResponse({ status: 201, type: Category })
	@ApiResponse({ status: 400, description: 'Categoria não encontrada' })
	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.categoriesService.findOne(id);
	}

	@ApiBearerAuth()
	@ApiOperation({ summary: 'Atualiza uma categoria' })
	@ApiParam({ name: 'id', description: 'UUID da categoria', required: true })
	@ApiBody({ type: UpdateCategoryDto })
	@ApiResponse({ status: 200, type: Category, isArray: true })
	@ApiResponse({ status: 400, description: 'Categoria não encontrada' })
	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateCategoryDto: UpdateCategoryDto,
	) {
		return this.categoriesService.update(id, updateCategoryDto);
	}

	@ApiBearerAuth()
	@ApiOperation({ summary: 'Deleta uma categoria' })
	@ApiParam({ name: 'id', description: 'UUID da categoria', required: true })
	@ApiResponse({ status: 200, type: Category, isArray: true })
	@ApiResponse({ status: 400, description: 'Categoria não encontrada' })
	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.categoriesService.remove(id);
	}
}
