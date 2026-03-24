import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LeadsModule } from '../../modules/leads/leads.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../modules/common/prisma/prisma.module';
import { UsersModule } from '../../modules/users/users.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../../modules/common/guards/auth.guard';
import { JwtModule } from '../../modules/common/jwt/jwt.module';
import { GlobalExceptionsFilter } from '../../modules/common/filters/global-exceptions.filter';
import { CitiesModule } from '../../modules/cities/cities.module';
import { MediasModule } from '../../modules/medias/medias.module';
import { CompaniesModule } from '../../modules/companies/companies.module';
import { EventsModule } from '../../modules/events/events.module';
import { CategoriesModule } from '../../modules/categories/categories.module';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    LeadsModule,
    UsersModule,
    JwtModule,
    CitiesModule,
    MediasModule,
    CompaniesModule,
    EventsModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionsFilter,
    },
  ],
})
export class AppModule {}
