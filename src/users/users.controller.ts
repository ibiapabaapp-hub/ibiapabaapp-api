import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { UserRole } from '@prisma/client';
import { UserRoles } from 'src/common/decorators/user-roles.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { SecureUserDto } from './dtos/secure-user-dto';

@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtém todos os usuários' })
  @ApiResponse({ status: 200, type: SecureUserDto, isArray: true })
  @Get()
  @UserRoles([UserRole.superuser])
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar um usuário pelo ID' })
  @ApiParam({ name: 'id', description: 'UUID do usuário' })
  @ApiResponse({ status: 200, type: SecureUserDto })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @Get(':id')
  @UserRoles([UserRole.superuser])
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar dados de um usuário' })
  @ApiResponse({ status: 200, type: SecureUserDto })
  @Patch(':id')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // TODO: refatorar para permitir que usuário delete sua conta através da senha correta
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover um usuário' })
  @ApiResponse({ status: 200, description: 'Mensagem de sucesso' })
  @Delete(':id')
  @UserRoles([UserRole.superuser])
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
