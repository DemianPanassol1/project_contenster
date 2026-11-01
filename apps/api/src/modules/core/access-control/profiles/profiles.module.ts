import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Functionality } from '@/modules/core/access-control/functionalities/entities/functionality.entity';
import { FunctionalityModule } from '@/modules/core/access-control/functionalities/functionality.module';
import { ActionsModule } from '@/modules/core/authorization/actions/actions.module';
import { Action } from '@/modules/core/authorization/actions/entities/action.entity';
import { Language } from '@/modules/core/communication/languages/entities/language.entity';
import { AuthenticationModule } from '@/modules/core/identity/authentication/authentication.module';
import { UserProfile } from '@/modules/core/identity/users/entities/user-profile.entity';

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
      Functionality,
      Action,
      Language,
      UserProfile,
    ]),
    AuthenticationModule,
    FunctionalityModule,
    ActionsModule,
  ],
  controllers: [ProfilesController],
  providers: [ProfilesRepository, ProfilesService],
  exports: [ProfilesRepository],
})
export class ProfilesModule {}
