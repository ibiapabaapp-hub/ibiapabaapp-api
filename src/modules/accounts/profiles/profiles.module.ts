import { Module } from '@nestjs/common';
import { JwtModule } from 'src/modules/common/jwt/jwt.module';

import { ProfileOwnershipGuard } from './guards/profile-ownership.guard';
import { ProfileInterestsService } from './interests.service';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
	imports: [JwtModule],
	controllers: [ProfilesController],
	providers: [ProfilesService, ProfileInterestsService, ProfileOwnershipGuard],
	exports: [ProfilesService, ProfileInterestsService],
})
export class ProfilesModule {}
