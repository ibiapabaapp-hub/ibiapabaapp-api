import { Module } from '@nestjs/common';
import { AccountsModule } from 'src/modules/accounts/accounts.module';
import { JwtModule } from 'src/modules/common/jwt/jwt.module';

import { TokenModule } from '../common/token/token.module';
import { EmailModule } from '../email/email.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleOAuthService } from './oauth/google-oauth.service';

@Module({
	imports: [
		JwtModule,
		AccountsModule,
		EmailModule,
		TokenModule,
	],
	controllers: [AuthController],
	providers: [AuthService, GoogleOAuthService],
})
export class AuthModule {}
