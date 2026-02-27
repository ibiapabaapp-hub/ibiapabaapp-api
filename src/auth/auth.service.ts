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

import { PasswordService } from '../common/password/password.service';
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
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  private generateAuthResponse(user: Omit<User, 'password'>) {
    const payload = { id: user.id, role: user.role };

    return {
      user,
      accessToken: this.jwtService.sign(payload, { expiresIn: '40m' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  // TODO: implementar global exception filter para tratamento de erro eficiente
  private handleError(e: any): never {
    if (e instanceof HttpException) throw e;

    const message = e instanceof Error ? e.message : 'Unknown error';
    const code = e instanceof Error ? 'internal_server_error' : 'unknown';

    throw new InternalServerErrorException({
      message: message || 'Internal server error',
      code: code,
    });
  }

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

      return this.generateAuthResponse(user);
    } catch (e) {
      this.handleError(e);
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

      return this.generateAuthResponse(user);
    } catch (e) {
      this.handleError(e);
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

    return this.generateAuthResponse(user);
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
