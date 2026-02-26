import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { CheckUniqueDto } from './dtos/check-unique-field.dto';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @Post('refresh')
  @Public()
  async refresh(@Headers('x-refresh-token') token: string) {
    // TODO: refatorar para utilizar custom header x-refresh-token
    const { user, accessToken, refreshToken } =
      await this.authService.refreshTokens(token);

    // response.cookie('refreshToken', refreshToken, {
    //   httpOnly: true,
    //   sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    //   secure: process.env.NODE_ENV === 'production' ? true : false,
    // });

    return { user, accessToken, refreshToken };
  }

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

  @Public()
  @Get('check-unique')
  async checkUnique(@Query() dto: CheckUniqueDto) {
    return this.authService.isUniqueAvailable(dto.field, dto.value);
  }

  @Get('me')
  async getMe(@Headers('Authorization') authorization: string) {
    return this.authService.getMe(authorization);
  }
}
