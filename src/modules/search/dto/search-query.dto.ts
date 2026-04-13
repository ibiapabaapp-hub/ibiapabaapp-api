import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SearchQueryDto {
	@ApiProperty({
		description: 'Termo de pesquisa (mínimo 2 caracteres)',
		example: 'ibiapaba',
	})
	@IsNotEmpty({ message: 'O termo de pesquisa não pode estar vazio' })
	@IsString({ message: 'O termo de pesquisa deve ser uma string' })
	@MinLength(2, {
		message: 'O termo de pesquisa deve ter pelo menos 2 caracteres',
	})
	q: string;
}
