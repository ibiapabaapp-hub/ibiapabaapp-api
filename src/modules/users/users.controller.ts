import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Put,
	Query,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiResponse,
} from '@nestjs/swagger';
import { user_role } from '@prisma/client';
import { UserRoles } from 'src/modules/common/decorators/user-roles.decorator';

import { PaginationDto } from '../common/dtos/pagination.dto';
import { AddUserInterestDto } from './dtos/add-user-interest.dto';
import { SecureUserDto } from './dtos/secure-user-dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserCompany } from './entities/user_company.entity';
import {
	InterestsCount,
	UserInterestsResponse,
} from './entities/user_interest.entity';
import { UserCompaniesService } from './user_companies.service';
import { UserInterestsService } from './user_interests.service';
import { UsersService } from './users.service';

@Controller({ path: 'users', version: '1' })
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		private readonly interestsService: UserInterestsService,
		private readonly userCompaniesService: UserCompaniesService,
	) {}

	// ─── GET: /users ─────────────────────────────────────────────────────────────
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Obtém todos os usuários' })
	@ApiResponse({ status: 200, type: SecureUserDto, isArray: true })
	@Get()
	@UserRoles([user_role.superuser])
	findAll(@Query() paginationDto: PaginationDto) {
		return this.usersService.findAll(paginationDto);
	}

	// ─── GET: /users/:id ─────────────────────────────────────────────────────────
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Buscar um usuário pelo ID' })
	@ApiParam({ name: 'id', description: 'UUID do usuário' })
	@ApiResponse({ status: 200, type: SecureUserDto })
	@ApiResponse({ status: 404, description: 'Usuário não encontrado' })
	@Get(':id')
	@UserRoles([user_role.superuser])
	findOneById(@Param('id', ParseUUIDPipe) id: string) {
		return this.usersService.findOneById(id);
	}

	// ─── PATCH: /users/:id ───────────────────────────────────────────────────────
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Atualizar dados de um usuário' })
	@ApiResponse({ status: 200, type: SecureUserDto })
	@Patch(':id')
	update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		return this.usersService.update(id, updateUserDto);
	}

	// ─── DELETE: /users/:id ──────────────────────────────────────────────────────
	// TODO: refatorar para permitir que usuário delete sua conta através da senha correta
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Remover um usuário' })
	@ApiResponse({ status: 200, description: 'Mensagem de sucesso' })
	@Delete(':id')
	@UserRoles([user_role.superuser])
	remove(@Param('id') id: string) {
		return this.usersService.remove(id);
	}

	// ─── GET: /users/:id/interests ───────────────────────────────────────────────
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Listar interesses de um usuário' })
	@ApiParam({ name: 'id', description: 'UUID do usuário' })
	@ApiResponse({ status: 200, type: UserInterestsResponse })
	@Get(':id/interests')
	getInterests(@Param('id', ParseUUIDPipe) userId: string) {
		return this.interestsService.listInterests(userId);
	}

	// ─── PUT: /users/:id/interests ───────────────────────────────────────────────
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Atualizar interesses de um usuário' })
	@ApiParam({ name: 'id', description: 'UUID do usuário' })
	@ApiBody({
		type: AddUserInterestDto,
		description: 'Objeto contendo arrays de UUIDs para empresas e eventos',
	})
	@ApiResponse({ status: 200, type: InterestsCount })
	@Put(':id/interests')
	updateInterests(
		@Param('id', ParseUUIDPipe) userId: string,
		@Body() dto: AddUserInterestDto,
	) {
		return this.interestsService.updateInterests(
			userId,
			dto.companies_ids,
			dto.events_ids,
		);
	}

	/// TODO: implementar adição de usuário a empresa (no módulo de empresa ficaria melhor)
	// ─── GET: /users/:id/companies ───────────────────────────────────────────────
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Listar empresas de um usuário' })
	@ApiParam({ name: 'id', description: 'UUID do usuário' })
	@ApiResponse({ status: 200, type: UserCompany })
	@Get(':id/companies')
	getUserCompanies(@Param('id', ParseUUIDPipe) userId: string) {
		return this.userCompaniesService.listUserCompanies(userId);
	}
}
