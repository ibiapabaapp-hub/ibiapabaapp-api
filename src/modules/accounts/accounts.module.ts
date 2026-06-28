import { Module } from '@nestjs/common';
import { JwtModule } from 'src/modules/common/jwt/jwt.module';

import { AccountInterestsService } from './account-interests.service';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

@Module({
	imports: [JwtModule],
	controllers: [AccountsController],
	providers: [AccountsService, AccountInterestsService],
	exports: [AccountsService, AccountInterestsService],
})
export class AccountsModule {}
