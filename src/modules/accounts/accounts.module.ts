import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "src/modules/common/jwt/jwt.module";
import { PasswordModule } from "src/modules/common/password/password.module";

import { RolesGuard } from "./guards/user-roles.guard";
import { AccountsController } from "./accounts.controller";
import { AccountsService } from "./accounts.service";
import { ProfilesModule } from "./profiles/profiles.module";

@Module({
  imports: [PasswordModule, JwtModule, ProfilesModule],
  controllers: [AccountsController],
  providers: [AccountsService, { provide: APP_GUARD, useClass: RolesGuard }],
  exports: [AccountsService, ProfilesModule],
})
export class AccountsModule {}
