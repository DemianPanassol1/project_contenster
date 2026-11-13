import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { City } from '@/modules/core/locations/cities/entities/city.entity';
import { CountriesModule } from '@/modules/core/locations/countries/countries.module';
import { Country } from '@/modules/core/locations/countries/entities/country.entity';
import { Language } from '@/modules/core/system-admin/languages/entities/language.entity';

import { State } from './entities/state.entity';
import { StateTranslation } from './entities/state-translation.entity';
import { StatesController } from './states.controller';
import { StatesRepository } from './states.repository';
import { StatesService } from './states.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([State, StateTranslation, Country, Language, City]),
    CountriesModule,
  ],
  controllers: [StatesController],
  providers: [StatesRepository, StatesService],
  exports: [StatesService],
})
export class StatesModule {}
