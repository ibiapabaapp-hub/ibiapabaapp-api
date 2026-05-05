import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from 'src/modules/common/jwt/jwt.module';
import { PasswordModule } from 'src/modules/common/password/password.module';

import { AccountInterestsService } from './account-interests.service';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { RolesGuard } from './guards/user-roles.guard';

@Module({
	imports: [PasswordModule, JwtModule],
	controllers: [AccountsController],
	providers: [
		AccountsService,
		AccountInterestsService,
		{ provide: APP_GUARD, useClass: RolesGuard },
	],
	exports: [AccountsService, AccountInterestsService],
})
export class AccountsModule {}
