import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/user-roles.guard';
import { PasswordModule } from 'src/common/password/password.module';
import { JwtModule } from 'src/common/jwt/jwt.module';

@Module({
  imports: [PasswordModule, JwtModule],
  controllers: [UsersController],
  providers: [UsersService, { provide: APP_GUARD, useClass: RolesGuard }],
  exports: [UsersService],
})
export class UsersModule {}
