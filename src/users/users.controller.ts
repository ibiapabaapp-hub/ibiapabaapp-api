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
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { user_role } from '@prisma/client';
import { UserRoles } from 'src/common/decorators/user-roles.decorator';

@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Post para criar usuário não é necessário, dado que isso acontece no em /auth/register
  // TODO: dúvida: seria bom ter o createUser dentro de UsersService para AuthModule chamar? Ele usa prismaService direto

  @Get()
  @UserRoles([user_role.superuser])
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Get(':id')
  @UserRoles([user_role.superuser])
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // TODO: refatorar para permitir que usuário delete sua conta através da senha correta
  @Delete(':id')
  @UserRoles([user_role.superuser])
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
