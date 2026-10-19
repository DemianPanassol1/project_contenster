import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Language } from '@/modules/communication/languages/entities/language.entity';
import { Client } from '@/modules/identity/clients/entities/client.entity';
import { State } from '@/modules/locations/states/entities/state.entity';

import { City } from './entities/city.entity';
import { CityTranslation } from './entities/city-translation.entity';
import { CitiesController } from './cities.controller';
import { CitiesRepository } from './cities.repository';
import { CitiesService } from './cities.service';

@Module({
  imports: [TypeOrmModule.forFeature([City, CityTranslation, State, Language, Client])],
  controllers: [CitiesController],
  providers: [CitiesRepository, CitiesService],
})
export class CitiesModule {}
