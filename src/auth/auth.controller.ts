import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { CheckUniqueDto } from './dtos/check-unique-field.dto';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthResponseDto, UserResponse } from './dtos/auth-response.dto';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Realizar login',
    description: 'Retorna tokens de acesso e dados do usuário',
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @Post('login')
  @Public()
  async login(@Body() loginDto: LoginDto) {
    const authData = await this.authService.login(loginDto);

    // for web
    // response.cookie('refreshToken', authData.refreshToken, {
    //   httpOnly: true,
    //   sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    //   secure: process.env.NODE_ENV === 'production' ? true : false,
    // });

    return {
      user: authData.user,
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
    };
  }

  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    type: AuthResponseDto,
  })
  @Post('register')
  @Public()
  async register(@Body() registerDto: RegisterDto) {
    const authData = await this.authService.register(registerDto);

    // response.cookie('refreshToken', authData?.refreshToken, {
    //   httpOnly: true,
    //   sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    //   secure: process.env.NODE_ENV === 'production' ? true : false,
    // });

    return {
      user: authData?.user,
      accessToken: authData?.accessToken,
      refreshToken: authData?.refreshToken,
    };
  }
  @ApiOperation({
    summary: 'Atualizar Access Token',
    description: 'Envia o x-refresh-token via Header para obter novos tokens',
  })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiHeader({
    name: 'x-refresh-token',
    required: true,
    description: 'Token de atualização enviado no header',
  })
  @Post('refresh')
  @Public()
  async refresh(@Headers('x-refresh-token') token: string) {
    const { user, accessToken, refreshToken } =
      await this.authService.refreshTokens(token);

    // response.cookie('refreshToken', refreshToken, {
    //   httpOnly: true,
    //   sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    //   secure: process.env.NODE_ENV === 'production' ? true : false,
    // });

    return { user, accessToken, refreshToken };
  }

  @ApiOperation({ summary: 'Encerrar sessão' })
  @ApiResponse({ status: 200, type: UserResponse })
  @Post('logout')
  logout() {
    // response.cookie('refreshToken', '', {
    //   httpOnly: true,
    //   expires: new Date(0),
    //   sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    //   secure: process.env.NODE_ENV === 'production' ? true : false,
    // });

    return { message: 'Logout realizado com sucesso' };
  }

  @ApiOperation({ summary: 'Checar se campo (email/telefone) já existe' })
  @ApiResponse({
    status: 200,
    description: 'Retorna se o valor está disponível para uso',
  })
  @Public()
  @Get('check-unique')
  async checkUnique(@Query() dto: CheckUniqueDto) {
    return this.authService.isUniqueAvailable(dto.field, dto.value);
  }

  @ApiOperation({ summary: 'Obter dados do usuário logado' })
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Checar validade de criação um campo único por seu valor',
  })
  @Get('me')
  async getMe(@Headers('Authorization') authorization: string) {
    return this.authService.getMe(authorization);
  }
}
