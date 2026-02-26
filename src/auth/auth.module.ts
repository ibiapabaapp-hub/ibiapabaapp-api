import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PasswordService } from 'src/common/password/password.service';
import { JwtService } from 'src/common/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PasswordService, JwtService, UsersService],
})
export class AuthModule {}
