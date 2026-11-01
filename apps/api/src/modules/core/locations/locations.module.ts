import { Module } from '@nestjs/common';

import { CitiesModule } from './cities/cities.module';
import { CountriesModule } from './countries/countries.module';
import { StatesModule } from './states/states.module';

@Module({
  imports: [CountriesModule, StatesModule, CitiesModule],
})
export class LocationsModule {}
