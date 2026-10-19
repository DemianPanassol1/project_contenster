import type { PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type DeepPartial, In, Repository } from 'typeorm';

import { Language } from '@/modules/communication/languages/entities/language.entity';
import { Client } from '@/modules/identity/clients/entities/client.entity';
import { State } from '@/modules/locations/states/entities/state.entity';
import { applyPaginatedQueryBuilder, type QueryFieldMap } from '@/shared/pagination';
import {
  buildTranslatedLabelExpression,
  buildTranslationQueryParameters,
} from '@/shared/translations';

import { City } from './entities/city.entity';
import { CityTranslation } from './entities/city-translation.entity';

const nameExpression = buildTranslatedLabelExpression({
  fieldColumn: 'nome',
  ownerColumn: 'cidade_id',
  ownerExpression: 'city.id',
  table: 'cidades_traducoes',
  uniqueAlias: 'city_name',
});

const stateNameExpression = buildTranslatedLabelExpression({
  fieldColumn: 'nome',
  ownerColumn: 'estado_id',
  ownerExpression: 'state.id',
  table: 'estados_traducoes',
  uniqueAlias: 'city_state_name',
});

const countryNameExpression = buildTranslatedLabelExpression({
  fieldColumn: 'nome',
  ownerColumn: 'pais_id',
  ownerExpression: 'country.id',
  table: 'paises_traducoes',
  uniqueAlias: 'city_country_name',
});

const LIST_FIELDS: QueryFieldMap = {
  id: 'city.id',
  stateId: 'state.id',
  stateCode: 'state.codigo',
  stateName: stateNameExpression,
  countryId: 'country.id',
  countryName: countryNameExpression,
  ibgeCode: 'city.codigo_ibge',
  isActive: 'city.eh_ativo',
  name: nameExpression,
};

@Injectable()
export class CitiesRepository {
  constructor(
    @InjectRepository(City) private readonly cities: Repository<City>,
    @InjectRepository(State) private readonly states: Repository<State>,
    @InjectRepository(Language) private readonly languages: Repository<Language>,
    @InjectRepository(Client) private readonly clients: Repository<Client>,
  ) {}

  list(request: PaginateRequest, locale: string): Promise<[City[], number]> {
    const query = this.cities
      .createQueryBuilder('city')
      .leftJoinAndSelect('city.state', 'state')
      .leftJoinAndSelect('state.country', 'country')
      .leftJoinAndSelect('city.translations', 'translations')
      .leftJoinAndSelect('translations.language', 'translationLanguage')
      .setParameters(buildTranslationQueryParameters(locale));

    return applyPaginatedQueryBuilder<City>(query, request, {
      defaultSort: [{ field: 'name', direction: 'asc' }],
      fields: LIST_FIELDS,
      tieBreaker: 'city.id',
    });
  }

  findById(id: number): Promise<City | null> {
    return this.cities.findOne({
      where: { id },
      relations: {
        state: { country: { translations: { language: true } }, translations: { language: true } },
        translations: { language: true },
      },
    });
  }

  findByIds(ids: number[]): Promise<City[]> {
    return this.cities.find({ where: { id: In(ids) } });
  }

  findStateById(id: number): Promise<State | null> {
    return this.states.findOneBy({ id });
  }

  findLanguagesByCodes(codes: string[]): Promise<Language[]> {
    return this.languages.find({ where: { languageCode: In(codes) } });
  }

  hasClients(ids: number[]): Promise<boolean> {
    return this.clients.exists({ where: { city: { id: In(ids) } } });
  }

  async save(
    city: DeepPartial<City> & { translations: DeepPartial<CityTranslation>[] },
  ): Promise<City> {
    return this.cities.manager.transaction(async (manager) => {
      let current: CityTranslation[] = [];

      if (city.id) {
        current = await manager.find(CityTranslation, {
          where: { city: { id: city.id } },
          relations: { language: true },
        });
      }

      const ids = new Map(current.map((item) => [item.language.id, item.id]));

      return manager.save(City, {
        ...city,
        translations: city.translations.map((translation) => {
          const id = ids.get(translation.language?.id ?? 0);

          if (id === undefined) {
            return translation;
          }

          return { ...translation, id };
        }),
      });
    });
  }

  async delete(cities: City[]): Promise<number[]> {
    const ids = cities.map((city) => city.id);
    await this.cities.remove(cities);
    return ids;
  }
}
