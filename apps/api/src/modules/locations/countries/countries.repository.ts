import type { PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type DeepPartial, In, Repository } from 'typeorm';

import { Language } from '@/modules/communication/languages/entities/language.entity';
import { State } from '@/modules/locations/states/entities/state.entity';
import { applyPaginatedQueryBuilder, type QueryFieldMap } from '@/shared/pagination';
import {
  buildTranslatedLabelExpression,
  buildTranslationQueryParameters,
} from '@/shared/translations';

import { Country } from './entities/country.entity';
import { CountryTranslation } from './entities/country-translation.entity';

const nameExpression = buildTranslatedLabelExpression({
  fieldColumn: 'nome',
  ownerColumn: 'pais_id',
  ownerExpression: 'country.id',
  table: 'paises_traducoes',
  uniqueAlias: 'country_name',
});

const LIST_FIELDS: QueryFieldMap = {
  id: 'country.id',
  isActive: 'country.eh_ativo',
  iso2: 'country.iso2',
  iso3: 'country.iso3',
  name: nameExpression,
};

@Injectable()
export class CountriesRepository {
  constructor(
    @InjectRepository(Country) private readonly countries: Repository<Country>,
    @InjectRepository(Language) private readonly languages: Repository<Language>,
    @InjectRepository(State) private readonly states: Repository<State>,
  ) {}

  list(request: PaginateRequest, locale: string): Promise<[Country[], number]> {
    const query = this.countries
      .createQueryBuilder('country')
      .leftJoinAndSelect('country.translations', 'translations')
      .leftJoinAndSelect('translations.language', 'translationLanguage')
      .setParameters(buildTranslationQueryParameters(locale));

    return applyPaginatedQueryBuilder<Country>(query, request, {
      defaultSort: [{ field: 'name', direction: 'asc' }],
      fields: LIST_FIELDS,
      tieBreaker: 'country.id',
    });
  }

  findById(id: number): Promise<Country | null> {
    return this.countries.findOne({
      where: { id },
      relations: { translations: { language: true } },
    });
  }

  findByIds(ids: number[]): Promise<Country[]> {
    return this.countries.find({ where: { id: In(ids) } });
  }

  findLanguagesByCodes(languageCodes: string[]): Promise<Language[]> {
    return this.languages.find({ where: { languageCode: In(languageCodes) } });
  }

  async save(
    country: DeepPartial<Country> & { translations: DeepPartial<CountryTranslation>[] },
  ): Promise<Country> {
    return this.countries.manager.transaction(async (manager) => {
      let existing: CountryTranslation[] = [];

      if (country.id) {
        existing = await manager.find(CountryTranslation, {
          where: { country: { id: country.id } },
          relations: { language: true },
        });
      }

      const translationIds = new Map(existing.map((item) => [item.language.id, item.id]));

      return manager.save(Country, {
        ...country,
        translations: country.translations.map((translation) => {
          const id = translationIds.get(translation.language?.id ?? 0);

          if (id === undefined) {
            return translation;
          }

          return { ...translation, id };
        }),
      });
    });
  }

  hasStates(ids: number[]): Promise<boolean> {
    return this.states.exists({ where: { country: { id: In(ids) } } });
  }

  async delete(countries: Country[]): Promise<number[]> {
    const ids = countries.map((country) => country.id);
    await this.countries.remove(countries);
    return ids;
  }
}
