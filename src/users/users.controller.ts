import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Post,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { user_role } from '@prisma/client';
import { UserRoles } from 'src/common/decorators/user-roles.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { SecureUserDto } from './dtos/secure-user-dto';
import { AddInterestsDto } from './dtos/add-interests.dto';
import { InterestsService } from './interests.service';
import { InterestsCount, UserInterest } from './entities/user_interest.entity';

@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly interestsService: InterestsService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtém todos os usuários' })
  @ApiResponse({ status: 200, type: SecureUserDto, isArray: true })
  @Get()
  @UserRoles([user_role.superuser])
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar um usuário pelo ID' })
  @ApiParam({ name: 'id', description: 'UUID do usuário' })
  @ApiResponse({ status: 200, type: SecureUserDto })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @Get(':id')
  @UserRoles([user_role.superuser])
  findOneById(@Param('id') id: string) {
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
  @UserRoles([user_role.superuser])
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adicionar interesses de um usuário' })
  @ApiParam({ name: 'id', description: 'UUID do usuário' })
  @ApiBody({
    type: AddInterestsDto,
    isArray: true,
    description: "Array de uuid's dos interesses do usuário",
  })
  @ApiResponse({ status: 200, type: InterestsCount })
  @Post(':uuid/interests')
  addInterests(
    @Param('uuid', ParseUUIDPipe) userId: string,
    @Body() dto: AddInterestsDto,
  ) {
    return this.interestsService.addInterests(userId, dto.category_ids);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar interesses de um usuário' })
  @ApiParam({ name: 'id', description: 'UUID do usuário' })
  @ApiResponse({ status: 200, type: UserInterest, isArray: true })
  @Get(':uuid/interests')
  getInterests(@Param('uuid', ParseUUIDPipe) userId: string) {
    return this.interestsService.listInterests(userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar interesses de um usuário' })
  @ApiParam({ name: 'id', description: 'UUID do usuário' })
  @ApiBody({
    type: AddInterestsDto,
    isArray: true,
    description: "Array de uuid's dos interesses do usuário",
  })
  @ApiResponse({ status: 200, type: InterestsCount })
  @Patch(':uuid/interests')
  updateInterests(
    @Param('uuid', ParseUUIDPipe) userId: string,
    @Body() dto: AddInterestsDto,
  ) {
    return this.interestsService.updateInterests(userId, dto.category_ids);
  }
}
