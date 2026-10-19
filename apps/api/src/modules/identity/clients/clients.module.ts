import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Language } from '@/modules/communication/languages/entities/language.entity';
import { AuthenticationModule } from '@/modules/identity/authentication/authentication.module';
import { City } from '@/modules/locations/cities/entities/city.entity';

import { Client } from './entities/client.entity';
import { ClientLanguage } from './entities/client-language.entity';
import { ClientsController } from './clients.controller';
import { ClientsRepository } from './clients.repository';
import { ClientsService } from './clients.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([Client, ClientLanguage, Language, City]),
    AuthenticationModule,
  ],
  controllers: [ClientsController],
  providers: [ClientsRepository, ClientsService],
})
export class ClientsModule {}
