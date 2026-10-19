import type { PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type DeepPartial, In, Repository } from 'typeorm';

import { applyPaginatedQueryBuilder, type QueryFieldMap } from '@/shared/pagination';

import { Language } from './entities/language.entity';

const LIST_FIELDS: QueryFieldMap = {
  id: 'language.id',
  languageCode: 'language.codigo_idioma',
  name: 'language.nome',
  regionCode: 'language.codigo_regiao',
};

@Injectable()
export class LanguagesRepository {
  constructor(@InjectRepository(Language) private readonly languages: Repository<Language>) {}

  list(request: PaginateRequest): Promise<[Language[], number]> {
    return applyPaginatedQueryBuilder(this.languages.createQueryBuilder('language'), request, {
      defaultSort: [{ field: 'name', direction: 'asc' }],
      fields: LIST_FIELDS,
      tieBreaker: 'language.id',
    });
  }

  findById(id: number): Promise<Language | null> {
    return this.languages.findOneBy({ id });
  }

  findByIds(ids: number[]): Promise<Language[]> {
    return this.languages.findBy({ id: In(ids) });
  }

  save(language: DeepPartial<Language>): Promise<Language> {
    return this.languages.save(language);
  }

  async delete(languages: Language[]): Promise<number[]> {
    const ids = languages.map((language) => language.id);
    await this.languages.remove(languages);
    return ids;
  }
}
