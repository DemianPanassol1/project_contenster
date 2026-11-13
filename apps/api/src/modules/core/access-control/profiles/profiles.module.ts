import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FunctionalityModule } from '@/modules/core/access-control/functionalities/functionality.module';
import { AuthenticationModule } from '@/modules/core/identity/authentication/authentication.module';
import { UserProfile } from '@/modules/core/identity/users/entities/user-profile.entity';
import { SystemAdminActionsModule } from '@/modules/core/system-admin/actions/actions.module';
import { Language } from '@/modules/core/system-admin/languages/entities/language.entity';

import { ProfilePermission } from './entities/profile-permission.entity';
import { Profile } from './entities/profiles.entity';
import { ProfileTranslation } from './entities/profiles-translation.entity';
import { ProfilesController } from './profiles.controller';
import { ProfilesRepository } from './profiles.repository';
import { ProfilesService } from './profiles.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Profile,
      ProfileTranslation,
      ProfilePermission,
      Language,
      UserProfile,
    ]),
    AuthenticationModule,
    FunctionalityModule,
    SystemAdminActionsModule,
  ],
  controllers: [ProfilesController],
  providers: [ProfilesRepository, ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
