import type { PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type DeepPartial, In, Repository } from 'typeorm';

import { Language } from '@/modules/communication/languages/entities/language.entity';
import { City } from '@/modules/locations/cities/entities/city.entity';
import { applyPaginatedQueryBuilder, type QueryFieldMap } from '@/shared/pagination';

import { Client } from './entities/client.entity';
import { ClientLanguage } from './entities/client-language.entity';

const AVAILABLE_LANGUAGE_FIELDS: QueryFieldMap = {
  id: 'language.id',
  languageCode: 'language.codigo_idioma',
  name: 'language.nome',
  regionCode: 'language.codigo_regiao',
};

@Injectable()
export class ClientsRepository {
  constructor(
    @InjectRepository(Client) private readonly clients: Repository<Client>,
    @InjectRepository(Language) private readonly languages: Repository<Language>,
    @InjectRepository(City) private readonly cities: Repository<City>,
  ) {}

  findById(id: number): Promise<Client | null> {
    return this.clients.findOne({
      where: { id },
      relations: { image: true, city: true, availableLanguageLinks: { language: true } },
    });
  }

  findCity(id: number): Promise<City | null> {
    return this.cities.findOneBy({ id });
  }

  findLanguages(ids: number[]): Promise<Language[]> {
    return this.languages.findBy({ id: In(ids) });
  }

  listAvailableLanguages(
    clientId: number,
    request: PaginateRequest,
  ): Promise<[Language[], number]> {
    const query = this.languages
      .createQueryBuilder('language')
      .innerJoin(
        ClientLanguage,
        'clientLanguage',
        'clientLanguage.idioma_id = language.id AND clientLanguage.cliente_id = :clientId',
        { clientId },
      );

    return applyPaginatedQueryBuilder<Language>(query, request, {
      defaultSort: [{ field: 'name', direction: 'asc' }],
      fields: AVAILABLE_LANGUAGE_FIELDS,
      tieBreaker: 'language.id',
    });
  }

  findAvailableLanguagesByIds(clientId: number, ids: number[]): Promise<Language[]> {
    return this.languages
      .createQueryBuilder('language')
      .innerJoin(
        ClientLanguage,
        'clientLanguage',
        'clientLanguage.idioma_id = language.id AND clientLanguage.cliente_id = :clientId',
        { clientId },
      )
      .where('language.id IN (:...ids)', { ids })
      .getMany();
  }

  async save(
    client: DeepPartial<Client> & { availableLanguageLinks: DeepPartial<ClientLanguage>[] },
  ): Promise<Client> {
    return this.clients.save(client);
  }
}
