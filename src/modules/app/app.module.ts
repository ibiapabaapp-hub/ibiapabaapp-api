import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { AuthModule } from "src/modules/auth/auth.module";

import { CategoriesModule } from "../../modules/categories/categories.module";
import { CitiesModule } from "../../modules/cities/cities.module";
import { GlobalExceptionsFilter } from "../../modules/common/filters/global-exceptions.filter";
import { AuthGuard } from "../../modules/common/guards/auth.guard";
import { JwtModule } from "../../modules/common/jwt/jwt.module";
import { PrismaModule } from "../../modules/common/prisma/prisma.module";
import { BusinessesModule } from "../businesses/businesses.module";
import { EventsModule } from "../../modules/events/events.module";
import { LeadsModule } from "../../modules/leads/leads.module";
import { MediasModule } from "../../modules/medias/medias.module";
import { SearchModule } from "../../modules/search/search.module";
import { AccountsModule } from "../accounts/accounts.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
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
