import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PasswordService } from 'src/common/password/password.service';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/user-roles.guard';
import { JwtService } from 'src/common/jwt/jwt.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    PasswordService,
    JwtService,
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [UsersService],
})
export class UsersModule {}
