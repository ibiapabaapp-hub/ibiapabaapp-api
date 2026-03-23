import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateUserDto } from './dtos/update-user.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PasswordService } from 'src/common/password/password.service';
import { user_role } from '@prisma/client';
import { CreateUserDto } from './dtos/create-user.dto';
import { randomUUID } from 'crypto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async create(userData: CreateUserDto) {
    if (userData.password !== userData.password_confirm) {
      throw new BadRequestException({
        message: 'Password and password confirmation must be equal',
        code: 'password_mismatch',
      });
    }

    const user = await this.prismaService.user.create({
      data: {
        id: randomUUID(),
        name: userData.name.trim(),
        // cpf,
        birth_date: userData.birth_date,
        role: userData.role as user_role,
        email: userData.email.trim(),
        password: await this.passwordService.hashPassword(userData.password),
        username: userData.username.toLowerCase().trim(),
        phone_number: userData.phone_number,
      },
      omit: { password: true },
    });

    return user;
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset } = paginationDto;
    return await this.prismaService.user.findMany({
      take: limit,
      skip: offset,
      omit: { password: true },
    });
  }

  async findOneById(id: string) {
    const user = await this.prismaService.user.findFirst({
      where: { id },
      omit: { password: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findOneByEmail(email: string, getPassword: boolean = false) {
    const user = await this.prismaService.user.findFirst({
      where: { email },
      omit: { password: !getPassword },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userExists = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    if (!updateUserDto.password) {
      throw new BadRequestException('Current password is required for updates');
    }

    const isPasswordValid = await this.passwordService.verifyPassword(
      userExists.password,
      updateUserDto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { role, password, ...rest } = updateUserDto;

    const dataToUpdate: Partial<User> = {
      ...rest,
      updated_at: new Date(),
    };

    if (password) {
      dataToUpdate.password = await this.passwordService.hashPassword(password);
    }

    if (role) {
      dataToUpdate.role = role as user_role;
    }

    return this.prismaService.user.update({
      where: { id },
      data: dataToUpdate,
      omit: { password: true },
    });
  }

  async remove(id: string) {
    const user = await this.prismaService.user.findFirst({
      where: { id },
      omit: { password: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prismaService.user.delete({ where: { id } });
    return user;
  }
}
