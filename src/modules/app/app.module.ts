import { join } from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from 'src/modules/auth/auth.module';

import { CitiesModule } from '../../modules/cities/cities.module';
import { GlobalExceptionsFilter } from '../../modules/common/filters/global-exceptions.filter';
import { AuthGuard } from '../../modules/common/guards/auth.guard';
import { JwtModule } from '../../modules/common/jwt/jwt.module';
import { PrismaModule } from '../../modules/common/prisma/prisma.module';
import { EventsModule } from '../../modules/events/events.module';
import { LeadsModule } from '../../modules/leads/leads.module';
import { MediasModule } from '../../modules/medias/medias.module';
import { SearchModule } from '../../modules/search/search.module';
import { TagsModule } from '../../modules/tags/tags.module';
import { AccountsModule } from '../accounts/accounts.module';
import { BusinessesModule } from '../businesses/businesses.module';
import { ThrottlerBehindProxyGuard } from '../common/guards/throttler-behind-proxy-guard';
import { FavoritesModule } from '../favorites/favorites.module';
import { ReviewsModule } from '../reviews/reviews.module';
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
		ScheduleModule.forRoot(),
		...(process.env.NODE_ENV === 'development'
			? [
					ServeStaticModule.forRoot({
						rootPath: join(process.cwd(), 'public'),
						serveStaticOptions: {
							fallthrough: false,
						},
					}),
				]
			: []),
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
		FavoritesModule,
		ReviewsModule,
		TagsModule,
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
