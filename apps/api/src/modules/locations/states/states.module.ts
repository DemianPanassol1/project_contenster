import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Language } from '@/modules/communication/languages/entities/language.entity';
import { City } from '@/modules/locations/cities/entities/city.entity';
import { Country } from '@/modules/locations/countries/entities/country.entity';

import { State } from './entities/state.entity';
import { StateTranslation } from './entities/state-translation.entity';
import { StatesController } from './states.controller';
import { StatesRepository } from './states.repository';
import { StatesService } from './states.service';

@Module({
  imports: [TypeOrmModule.forFeature([State, StateTranslation, Country, Language, City])],
  controllers: [StatesController],
  providers: [StatesRepository, StatesService],
})
export class StatesModule {}
