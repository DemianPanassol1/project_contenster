import type { PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type DeepPartial, In, Repository } from 'typeorm';

import { SystemModule } from '@/modules/access-control/modules/entities/system-module.entity';
import { Language } from '@/modules/communication/languages/entities/language.entity';
import { applyPaginatedQueryBuilder, type QueryFieldMap } from '@/shared/pagination';
import {
  buildTranslatedLabelExpression,
  buildTranslationQueryParameters,
} from '@/shared/translations';

import { Functionality } from './entities/functionality.entity';
import { FunctionalityClientLanguage } from './entities/functionality-client-language.entity';
import { FunctionalityTranslation } from './entities/functionality-translation.entity';

const nameExpression = buildTranslatedLabelExpression({
  fieldColumn: 'nome',
  ownerColumn: 'funcionalidade_id',
  ownerExpression: 'functionality.id',
  table: 'funcionalidades_traducoes',
  uniqueAlias: 'functionality_name',
});
const LIST_FIELDS: QueryFieldMap = {
  id: 'functionality.id',
  isActive: 'functionality.eh_ativo',
  name: nameExpression,
  order: 'functionality.ordem',
  slug: 'functionality.slug',
};

@Injectable()
export class FunctionalityRepository {
  constructor(
    @InjectRepository(Functionality) private readonly functionalities: Repository<Functionality>,
    @InjectRepository(SystemModule) private readonly modules: Repository<SystemModule>,
    @InjectRepository(Language) private readonly languages: Repository<Language>,
  ) {}

  list(
    clientId: number,
    request: PaginateRequest,
    locale: string,
  ): Promise<[Functionality[], number]> {
    const query = this.functionalities
      .createQueryBuilder('functionality')
      .leftJoinAndSelect('functionality.module', 'module')
      .leftJoinAndSelect('functionality.parent', 'parent')
      .leftJoinAndSelect('functionality.translations', 'translations')
      .leftJoinAndSelect('translations.language', 'translationLanguage')
      .where('functionality.cliente_id = :clientId', { clientId })
      .setParameters(buildTranslationQueryParameters(locale));

    return applyPaginatedQueryBuilder<Functionality>(query, request, {
      defaultSort: [{ field: 'order', direction: 'asc' }],
      fields: LIST_FIELDS,
      tieBreaker: 'functionality.id',
    });
  }

  findById(clientId: number, id: number): Promise<Functionality | null> {
    return this.functionalities.findOne({
      where: { id, client: { id: clientId } },
      relations: {
        module: true,
        parent: true,
        translations: { language: true },
        enabledLanguageLinks: { language: true },
      },
    });
  }

  findByIds(clientId: number, ids: number[]): Promise<Functionality[]> {
    return this.functionalities.find({ where: { id: In(ids), client: { id: clientId } } });
  }

  findModule(clientId: number, id: number): Promise<SystemModule | null> {
    return this.modules.findOneBy({ id, client: { id: clientId } });
  }

  findParent(clientId: number, id: number): Promise<Functionality | null> {
    return this.functionalities.findOne({ where: { id, client: { id: clientId } } });
  }

  findLanguagesByIds(ids: number[]): Promise<Language[]> {
    return this.languages.findBy({ id: In(ids) });
  }
  async save(
    functionality: DeepPartial<Functionality> & {
      translations: DeepPartial<FunctionalityTranslation>[];
      enabledLanguageLinks: DeepPartial<FunctionalityClientLanguage>[];
    },
  ): Promise<Functionality> {
    return this.functionalities.save(functionality);
  }

  hasChildren(ids: number[]): Promise<boolean> {
    return this.functionalities.exists({ where: { parent: { id: In(ids) } } });
  }

  async delete(functionalities: Functionality[]): Promise<number[]> {
    const ids = functionalities.map((functionality) => functionality.id);
    await this.functionalities.remove(functionalities);
    return ids;
  }
}
