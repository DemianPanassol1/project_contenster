import type { PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type DeepPartial, In, Repository } from 'typeorm';

import { Language } from '@/modules/communication/languages/entities/language.entity';
import { City } from '@/modules/locations/cities/entities/city.entity';
import { Country } from '@/modules/locations/countries/entities/country.entity';
import { applyPaginatedQueryBuilder, type QueryFieldMap } from '@/shared/pagination';
import {
  buildTranslatedLabelExpression,
  buildTranslationQueryParameters,
} from '@/shared/translations';

import { State } from './entities/state.entity';
import { StateTranslation } from './entities/state-translation.entity';

const nameExpression = buildTranslatedLabelExpression({
  fieldColumn: 'nome',
  ownerColumn: 'estado_id',
  ownerExpression: 'state.id',
  table: 'estados_traducoes',
  uniqueAlias: 'state_name',
});

const countryNameExpression = buildTranslatedLabelExpression({
  fieldColumn: 'nome',
  ownerColumn: 'pais_id',
  ownerExpression: 'country.id',
  table: 'paises_traducoes',
  uniqueAlias: 'state_country_name',
});

const LIST_FIELDS: QueryFieldMap = {
  id: 'state.id',
  countryId: 'country.id',
  countryName: countryNameExpression,
  code: 'state.codigo',
  isActive: 'state.eh_ativo',
  name: nameExpression,
};

@Injectable()
export class StatesRepository {
  constructor(
    @InjectRepository(State) private readonly states: Repository<State>,
    @InjectRepository(Country) private readonly countries: Repository<Country>,
    @InjectRepository(Language) private readonly languages: Repository<Language>,
    @InjectRepository(City) private readonly cities: Repository<City>,
  ) {}

  list(request: PaginateRequest, locale: string): Promise<[State[], number]> {
    const query = this.states
      .createQueryBuilder('state')
      .leftJoinAndSelect('state.country', 'country')
      .leftJoinAndSelect('state.translations', 'translations')
      .leftJoinAndSelect('translations.language', 'translationLanguage')
      .setParameters(buildTranslationQueryParameters(locale));

    return applyPaginatedQueryBuilder<State>(query, request, {
      defaultSort: [{ field: 'name', direction: 'asc' }],
      fields: LIST_FIELDS,
      tieBreaker: 'state.id',
    });
  }

  findById(id: number): Promise<State | null> {
    return this.states.findOne({
      where: { id },
      relations: {
        country: { translations: { language: true } },
        translations: { language: true },
      },
    });
  }
  findByIds(ids: number[]): Promise<State[]> {
    return this.states.find({ where: { id: In(ids) } });
  }

  findCountryById(id: number): Promise<Country | null> {
    return this.countries.findOneBy({ id });
  }

  findLanguagesByCodes(codes: string[]): Promise<Language[]> {
    return this.languages.find({ where: { languageCode: In(codes) } });
  }

  hasCities(ids: number[]): Promise<boolean> {
    return this.cities.exists({ where: { state: { id: In(ids) } } });
  }

  async save(
    state: DeepPartial<State> & { translations: DeepPartial<StateTranslation>[] },
  ): Promise<State> {
    return this.states.save(state);
  }

  async delete(states: State[]): Promise<number[]> {
    const ids = states.map((state) => state.id);
    await this.states.remove(states);
    return ids;
  }
}
