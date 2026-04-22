import { Module } from '@nestjs/common';
import { AccountsModule } from 'src/modules/accounts/accounts.module';
import { JwtModule } from 'src/modules/common/jwt/jwt.module';
import { PasswordModule } from 'src/modules/common/password/password.module';

import { TokenModule } from '../common/token/token.module';
import { EmailModule } from '../email/email.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
	imports: [
		PasswordModule,
		JwtModule,
		AccountsModule,
		EmailModule,
		TokenModule,
		AccountsModule,
	],
	controllers: [AuthController],
	providers: [AuthService],
})
export class AuthModule {}
