import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { randomUUID } from 'node:crypto';

import { PasswordService } from 'src/common/password/password.service';
import { JwtService } from 'src/common/jwt/jwt.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { user_role } from '@prisma/client';
import { UniqueUserField } from './dtos/unique-user-fields';
import { extractBearerTokenFromString } from 'src/common/utils/extract-bearer-token';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly passwordService: PasswordService,
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}

  async login(loginDto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Omit<User, 'password'>;
  }> {
    const { email, password } = loginDto;

    try {
      const user = await this.prismaService.users.findUnique({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException({
          message: 'User not found',
          code: 'user_not_found',
        });
      }

      const isPasswordValid = await this.passwordService.verifyPassword(
        user.password,
        password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException({
          message: 'Invalid credentials',
          code: 'wrong_password',
        });
      }

      return {
        user: {
          id: user.id,
          // cpf: user.cpf,
          name: user.name,
          username: user.username,
          email: user.email,
          active: user.active,
          created_at: user.created_at,
          updated_at: user.updated_at,
          birth_date: user.birth_date,
          phone_number: user.phone_number,
          role: user.role,
        },
        accessToken: this.jwtService.sign(
          { id: user.id, role: user.role },
          { expiresIn: '40m' }, //40min
        ),
        refreshToken: this.jwtService.sign(
          { id: user.id, role: user.role },
          { expiresIn: '7d' },
        ),
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      if (e instanceof Error) {
        throw new InternalServerErrorException({
          message: e.message || 'Internal server error',
          code: 'internal_server_error',
        });
      }
      throw new InternalServerErrorException({
        message: 'Unknown error',
        code: 'unknown',
      });
    }
  }

  async register(registerDto: RegisterDto): Promise<
    | {
        accessToken: string;
        refreshToken: string;
        user: Omit<User, 'password'>;
      }
    | undefined
  > {
    const {
      name,
      username,
      // cpf,
      birth_date,
      role,
      email,
      phone_number,
      password,
      password_confirm,
    } = registerDto;

    if (password !== password_confirm) {
      throw new BadRequestException({
        message: 'Password and password confirmation must be equal',
        code: 'password_mismatch',
      });
    }

    try {
      const user = await this.prismaService.users.create({
        data: {
          id: randomUUID(),
          name: name.trim(),
          // cpf,
          birth_date,
          role: role as user_role,
          email: email.trim(),
          password: await this.passwordService.hashPassword(password),
          username: username.toLowerCase().trim(),
          phone_number,
        },
        omit: { password: true },
      });

      return {
        user: {
          id: user.id,
          // cpf: user.cpf,
          username: user.username,
          name: user.name,
          email: user.email,
          phone_number: user.phone_number,
          birth_date: user.birth_date,
          active: user.active,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
        accessToken: this.jwtService.sign(
          { id: user.id, role: user.role },
          { expiresIn: '40m' }, //40min
        ),
        refreshToken: this.jwtService.sign(
          { id: user.id, role: user.role },
          { expiresIn: '7d' },
        ),
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      if (e instanceof Error) {
        throw new InternalServerErrorException({
          message: e.message || 'Internal server error',
          code: 'internal_server_error',
        });
      }
      throw new InternalServerErrorException({
        message: 'Unknown error',
        code: 'unknown',
      });
    }
  }

  async refreshTokens(refreshToken: string): Promise<{
    user: Omit<User, 'password'>;
    refreshToken: string;
    accessToken: string;
  }> {
    const decodedTokenData = this.jwtService.verify<{
      id: string;
      role: number;
    }>(refreshToken);

    const user = await this.userService.findOne(decodedTokenData.id);
    if (!user) {
      throw new UnauthorizedException({
        message: 'Expired or invalid token',
        code: 'invalid_token',
      });
    }

    return {
      user,
      accessToken: this.jwtService.sign(
        { id: user.id, role: user.role },
        { expiresIn: '40m' }, //40min
      ),
      refreshToken: this.jwtService.sign(
        { id: user.id, role: user.role },
        { expiresIn: '7d' },
      ),
    };
  }

  async isUniqueAvailable<K extends UniqueUserField>(field: K, value: User[K]) {
    try {
      const count = await this.prismaService.users.count({
        where: {
          [field]: value,
        },
      });

      return {
        field,
        value,
        available: count === 0,
      };
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerErrorException(e.message);
      }
      throw new InternalServerErrorException('Unexpected error');
    }
  }

  async getMe(authorization: string) {
    const token = extractBearerTokenFromString(authorization);
    const { id } = this.jwtService.verify<{ id: string; role: string }>(token);
    return this.userService.findOne(id);
  }
}
