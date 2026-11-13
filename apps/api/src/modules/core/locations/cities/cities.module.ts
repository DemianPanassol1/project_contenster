import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Client } from '@/modules/core/identity/clients/entities/client.entity';
import { State } from '@/modules/core/locations/states/entities/state.entity';
import { StatesModule } from '@/modules/core/locations/states/states.module';
import { Language } from '@/modules/core/system-admin/languages/entities/language.entity';

import { City } from './entities/city.entity';
import { CityTranslation } from './entities/city-translation.entity';
import { CitiesController } from './cities.controller';
import { CitiesRepository } from './cities.repository';
import { CitiesService } from './cities.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([City, CityTranslation, State, Language, Client]),
    StatesModule,
  ],
  controllers: [CitiesController],
  providers: [CitiesRepository, CitiesService],
  exports: [CitiesService],
})
export class CitiesModule {}
