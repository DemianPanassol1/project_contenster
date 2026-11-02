import { Module } from '@nestjs/common';

import { SystemAdminCitiesModule } from './cities/cities.module';
import { SystemAdminCountriesModule } from './countries/countries.module';
import { SystemAdminStatesModule } from './states/states.module';

@Module({
  imports: [SystemAdminCountriesModule, SystemAdminStatesModule, SystemAdminCitiesModule],
})
export class SystemAdminLocationsModule {}
