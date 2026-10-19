import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Functionality } from '@/modules/access-control/functionalities/entities/functionality.entity';
import { Action } from '@/modules/authorization/actions/entities/action.entity';
import { Language } from '@/modules/communication/languages/entities/language.entity';
import { AuthenticationModule } from '@/modules/identity/authentication/authentication.module';
import { UserProfile } from '@/modules/identity/users/entities/user-profile.entity';

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
  ],
  controllers: [ProfilesController],
  providers: [ProfilesRepository, ProfilesService],
})
export class ProfilesModule {}
