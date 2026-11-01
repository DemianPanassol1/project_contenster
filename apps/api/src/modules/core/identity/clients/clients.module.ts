import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Language } from '@/modules/core/communication/languages/entities/language.entity';
import { LanguagesModule } from '@/modules/core/communication/languages/languages.module';
import { AuthenticationModule } from '@/modules/core/identity/authentication/authentication.module';
import { CitiesModule } from '@/modules/core/locations/cities/cities.module';
import { City } from '@/modules/core/locations/cities/entities/city.entity';

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
    LanguagesModule,
  ],
  controllers: [ClientsController],
  providers: [ClientsRepository, ClientsService],
  exports: [ClientsRepository],
})
export class ClientsModule {}
