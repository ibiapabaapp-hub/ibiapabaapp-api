import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/user-roles.guard';
import { PasswordModule } from 'src/modules/common/password/password.module';
import { JwtModule } from 'src/modules/common/jwt/jwt.module';
import { InterestsService } from './interests.service';

@Module({
  imports: [PasswordModule, JwtModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    InterestsService,
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [UsersService],
})
export class UsersModule {}
