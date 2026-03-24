import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { Category } from './entities/category.entity';
import { Public } from 'src/modules/common/decorators/public.decorator';

@Controller({ path: 'categories', version: '1' })
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Obtém todas as categorias-pai' })
  @ApiResponse({ status: 200, type: Category, isArray: true })
  @Public()
  @Get('/parents')
  getParents() {
    return this.categoriesService.findParents();
  }

  @ApiOperation({
    summary: 'Obtém todas as categorias-filhas de uma categoria pai por uuid',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da categoria-pai',
    required: true,
  })
  @ApiResponse({ status: 200, type: Category, isArray: true })
  @Public()
  @Get('/parents/:id/children')
  getChildren(@Param('id') id: string) {
    return this.categoriesService.findChildren(id);
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
