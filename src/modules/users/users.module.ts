import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from 'src/modules/common/jwt/jwt.module';
import { PasswordModule } from 'src/modules/common/password/password.module';

import { RolesGuard } from './guards/user-roles.guard';
import { UserInterestsService } from './user_interests.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserCompaniesService } from './user_companies.service';

@Module({
	imports: [PasswordModule, JwtModule],
	controllers: [UsersController],
	providers: [
		UsersService,
		UserInterestsService,
		UserCompaniesService,
		{ provide: APP_GUARD, useClass: RolesGuard },
	],
	exports: [UsersService],
})
export class UsersModule {}
