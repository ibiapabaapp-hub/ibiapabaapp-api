import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EmailService } from './email.service';
import { EMAIL_STRATEGY } from './strategies/email-strategy.interface';
import { ResendStrategy } from './strategies/resend.strategy';

@Module({
	imports: [ConfigModule],
	providers: [
		EmailService,
		{
			provide: EMAIL_STRATEGY,
			useClass: ResendStrategy,
		},
	],
	exports: [EmailService],
})
export class EmailModule {}
