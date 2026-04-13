import { Controller, Get, Query } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';

import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResponseDto } from './entities/search-result.entity';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller({ path: 'search', version: '1' })
export class SearchController {
	constructor(private readonly searchService: SearchService) {}

	@ApiBearerAuth()
	@Get()
	@ApiOperation({
		summary: 'Pesquisar cidades, empresas e eventos pelo nome',
		description:
			'Retorna resultados agrupados por tipo. Mínimo de 2 caracteres.',
	})
	@ApiResponse({
		status: 200,
		description: 'Resultados da pesquisa',
		type: SearchResponseDto,
	})
	async search(
		@Query() searchQueryDto: SearchQueryDto,
	): Promise<SearchResponseDto> {
		return this.searchService.search(searchQueryDto.q);
	}
}
