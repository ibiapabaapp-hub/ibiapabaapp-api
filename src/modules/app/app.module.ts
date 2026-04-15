import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from 'src/modules/auth/auth.module';

import { CategoriesModule } from '../../modules/categories/categories.module';
import { CitiesModule } from '../../modules/cities/cities.module';
import { GlobalExceptionsFilter } from '../../modules/common/filters/global-exceptions.filter';
import { AuthGuard } from '../../modules/common/guards/auth.guard';
import { JwtModule } from '../../modules/common/jwt/jwt.module';
import { PrismaModule } from '../../modules/common/prisma/prisma.module';
import { EventsModule } from '../../modules/events/events.module';
import { LeadsModule } from '../../modules/leads/leads.module';
import { MediasModule } from '../../modules/medias/medias.module';
import { ProfilesModule } from '../../modules/profiles/profiles.module';
import { SearchModule } from '../../modules/search/search.module';
import { AccountsModule } from '../accounts/accounts.module';
import { BusinessesModule } from '../businesses/businesses.module';
import { ThrottlerBehindProxyGuard } from '../common/guards/throttler-behind-proxy-guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
		}),
		ThrottlerModule.forRoot({
			throttlers: [
				{
					name: 'short',
					ttl: 1000,
					limit: 10,
				},
				{
					name: 'medium',
					ttl: 60000,
					limit: 100,
				},
			],
		}),
		PrismaModule,
		AuthModule,
		SearchModule,
		LeadsModule,
		AccountsModule,
		JwtModule,
		CitiesModule,
		MediasModule,
		BusinessesModule,
		EventsModule,
		CategoriesModule,
		ProfilesModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
		{
			provide: APP_GUARD,
			useClass: ThrottlerBehindProxyGuard,
		},
		{
			provide: APP_FILTER,
			useClass: GlobalExceptionsFilter,
		},
	],
})
export class AppModule {}
