import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Functionality } from '@/modules/core/access-control/functionalities/entities/functionality.entity';
import { SystemModule } from '@/modules/core/access-control/modules/entities/system-module.entity';
import { ProfilePermission } from '@/modules/core/access-control/profiles/entities/profile-permission.entity';
import { Profile } from '@/modules/core/access-control/profiles/entities/profiles.entity';
import { Action } from '@/modules/core/authorization/actions/entities/action.entity';
import { Language } from '@/modules/core/communication/languages/entities/language.entity';
import { AuthenticationModule } from '@/modules/core/identity/authentication/authentication.module';
import { Client } from '@/modules/core/identity/clients/entities/client.entity';
import { UserProfile } from '@/modules/core/identity/users/entities/user-profile.entity';

import { ClientsController } from './clients.controller';
import { ClientsRepository } from './clients.repository';
import { ClientsService } from './clients.service';

@Module({
  imports: [
    AuthenticationModule,
    TypeOrmModule.forFeature([
      Action,
      Client,
      Functionality,
      Language,
      Profile,
      ProfilePermission,
      SystemModule,
      UserProfile,
    ]),
  ],
  controllers: [ClientsController],
  providers: [ClientsRepository, ClientsService],
})
export class ClientsModule {}
