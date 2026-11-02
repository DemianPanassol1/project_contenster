import { Module } from '@nestjs/common';

import { CountriesModule } from '@/modules/core/locations/countries/countries.module';

import { SystemAdminCountriesController } from './countries.controller';

@Module({
  imports: [CountriesModule],
  controllers: [SystemAdminCountriesController],
})
export class SystemAdminCountriesModule {}
