import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Language } from '@/modules/communication/languages/entities/language.entity';
import { State } from '@/modules/locations/states/entities/state.entity';

import { Country } from './entities/country.entity';
import { CountryTranslation } from './entities/country-translation.entity';
import { CountriesController } from './countries.controller';
import { CountriesRepository } from './countries.repository';
import { CountriesService } from './countries.service';

@Module({
  imports: [TypeOrmModule.forFeature([Country, CountryTranslation, Language, State])],
  controllers: [CountriesController],
  providers: [CountriesRepository, CountriesService],
  exports: [CountriesRepository],
})
export class CountriesModule {}
