import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Query,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
} from '@nestjs/swagger';

import { PaginationDto } from '../common/dtos/pagination.dto';
import { SecureAccountDTO } from './dtos/secure-account-dto';
import { UpdateAccountDTO } from './dtos/update-account.dto';
import { AccountsService } from './accounts.service';

// TODO: modificações de segurança devido a falta de user_roles
@Controller({ path: 'accounts', version: '1' })
export class AccountsController {
	constructor(private readonly accountsService: AccountsService) {}

	// ─── GET: /accounts ─────────────────────────────────────────────────────────────
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Obtém todas as contas' })
	@ApiResponse({ status: 200, type: SecureAccountDTO, isArray: true })
	@Get()
	findAll(@Query() paginationDto: PaginationDto) {
		return this.accountsService.findAll(paginationDto);
	}

	// ─── GET: /accounts/:id ─────────────────────────────────────────────────────────
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Buscar uma conta pelo ID' })
	@ApiParam({ name: 'id', description: 'UUID da conta' })
	@ApiResponse({ status: 200, type: SecureAccountDTO })
	@ApiResponse({ status: 404, description: 'Conta não encontrada' })
	@Get(':id')
	findOneById(@Param('id', ParseUUIDPipe) id: string) {
		return this.accountsService.findOneById(id);
	}

	// ─── PATCH: /accounts/:id ───────────────────────────────────────────────────────
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Atualizar dados de uma conta' })
	@ApiResponse({ status: 200, type: SecureAccountDTO })
	@Patch(':id')
	update(@Param('id') id: string, @Body() updateUserDto: UpdateAccountDTO) {
		return this.accountsService.update(id, updateUserDto);
	}

	// ─── DELETE: /accounts/:id ──────────────────────────────────────────────────────
	// TODO: refatorar para permitir que usuário delete sua conta através da senha correta
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Remover uma conta' })
	@ApiResponse({ status: 200, description: 'Mensagem de sucesso' })
	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.accountsService.remove(id);
	}
}
