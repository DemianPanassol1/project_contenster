import { Module } from '@nestjs/common';

import { CitiesModule } from '@/modules/core/locations/cities/cities.module';

import { SystemAdminCitiesController } from './cities.controller';

@Module({
  imports: [CitiesModule],
  controllers: [SystemAdminCitiesController],
})
export class SystemAdminCitiesModule {}
