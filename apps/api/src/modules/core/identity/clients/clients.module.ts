import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthenticationModule } from '@/modules/core/identity/authentication/authentication.module';
import { CitiesModule } from '@/modules/core/locations/cities/cities.module';
import { City } from '@/modules/core/locations/cities/entities/city.entity';
import { Language } from '@/modules/core/system-admin/languages/entities/language.entity';
import { SystemAdminLanguagesModule } from '@/modules/core/system-admin/languages/languages.module';

import { Client } from './entities/client.entity';
import { ClientLanguage } from './entities/client-language.entity';
import { ClientsController } from './clients.controller';
import { ClientsRepository } from './clients.repository';
import { ClientsService } from './clients.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([Client, ClientLanguage, Language, City]),
    AuthenticationModule,
    CitiesModule,
    SystemAdminLanguagesModule,
  ],
  controllers: [ClientsController],
  providers: [ClientsRepository, ClientsService],
  exports: [ClientsRepository, ClientsService],
})
export class ClientsModule {}
