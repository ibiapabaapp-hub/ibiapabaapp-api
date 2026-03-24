import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PasswordModule } from 'src/modules/common/password/password.module';
import { JwtModule } from 'src/modules/common/jwt/jwt.module';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [PasswordModule, JwtModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
