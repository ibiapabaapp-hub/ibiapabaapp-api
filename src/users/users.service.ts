import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateUserDto } from './dtos/update-user.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PasswordService } from 'src/common/password/password.service';
import { user_role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset } = paginationDto;
    return await this.prismaService.users.findMany({
      take: limit,
      skip: offset,
      omit: { password: true },
    });
  }

  async findOne(id: string) {
    const user = await this.prismaService.users.findFirst({
      where: { id },
      omit: { password: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const userExists = await this.prismaService.users.findUnique({
        where: { id },
      });

      if (!userExists) {
        throw new NotFoundException('User not found');
      }

      if (!updateUserDto.password) {
        throw new BadRequestException(
          'Current password is required for updates',
        );
      }

      const isPasswordValid = await this.passwordService.verifyPassword(
        userExists.password,
        updateUserDto.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const { role, password, ...rest } = updateUserDto;

      const dataToUpdate: any = {
        ...rest,
        updated_at: new Date(),
      };

      if (password) {
        dataToUpdate.password =
          await this.passwordService.hashPassword(password);
      }

      if (role) {
        dataToUpdate.role = role as user_role;
      }

      return this.prismaService.users.update({
        where: { id },
        data: dataToUpdate,
        omit: { password: true },
      });
    } catch (e) {
      if (e instanceof HttpException) throw e;

      throw new InternalServerErrorException(e.message);
    }
  }

  async remove(id: string) {
    try {
      const user = await this.prismaService.users.findFirst({
        where: { id },
        omit: { password: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.prismaService.users.delete({ where: { id } });
      return user;
    } catch (e) {
      if (e instanceof HttpException) throw e;

      throw new InternalServerErrorException(e.message);
    }
  }
}
