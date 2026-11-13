import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProfilesModule } from '@/modules/core/access-control/profiles/profiles.module';
import { AuthenticationModule } from '@/modules/core/identity/authentication/authentication.module';
import { ClientsModule as IdentityClientsModule } from '@/modules/core/identity/clients/clients.module';
import { Client } from '@/modules/core/identity/clients/entities/client.entity';
import { UserProfile } from '@/modules/core/identity/users/entities/user-profile.entity';
import { CitiesModule } from '@/modules/core/locations/cities/cities.module';
import { ClientStorageModule } from '@/modules/core/media/client-storage/client-storage.module';
import { SystemAdminLanguagesModule } from '@/modules/core/system-admin/languages/languages.module';

import { ClientsController } from './clients.controller';
import { ClientsRepository } from './clients.repository';
import { ClientsService } from './clients.service';

@Module({
  imports: [
    AuthenticationModule,
    ClientStorageModule,
    CitiesModule,
    IdentityClientsModule,
    SystemAdminLanguagesModule,
    ProfilesModule,
    TypeOrmModule.forFeature([Client, UserProfile]),
  ],
  controllers: [ClientsController],
  providers: [ClientsRepository, ClientsService],
})
export class ClientsModule {}
