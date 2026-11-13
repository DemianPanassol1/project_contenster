import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { State } from '@/modules/core/locations/states/entities/state.entity';
import { Language } from '@/modules/core/system-admin/languages/entities/language.entity';

import { Country } from './entities/country.entity';
import { CountryTranslation } from './entities/country-translation.entity';
import { CountriesController } from './countries.controller';
import { CountriesRepository } from './countries.repository';
import { CountriesService } from './countries.service';

@Module({
  imports: [TypeOrmModule.forFeature([Country, CountryTranslation, Language, State])],
  controllers: [CountriesController],
  providers: [CountriesRepository, CountriesService],
  exports: [CountriesService],
})
export class CountriesModule {}
