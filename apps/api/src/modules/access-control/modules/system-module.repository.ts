import type { PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type DeepPartial, In, Repository } from 'typeorm';

import { Functionality } from '@/modules/access-control/functionalities/entities/functionality.entity';
import { Language } from '@/modules/communication/languages/entities/language.entity';
import { applyPaginatedQueryBuilder, type QueryFieldMap } from '@/shared/pagination';
import {
  buildTranslatedLabelExpression,
  buildTranslationQueryParameters,
} from '@/shared/translations';

import { SystemModule } from './entities/system-module.entity';
import { SystemModuleTranslation } from './entities/system-module-translation.entity';

const nameExpression = buildTranslatedLabelExpression({
  fieldColumn: 'nome',
  ownerColumn: 'modulo_id',
  ownerExpression: 'module.id',
  table: 'modulos_traducoes',
  uniqueAlias: 'module_name',
});
const LIST_FIELDS: QueryFieldMap = {
  id: 'module.id',
  isActive: 'module.eh_ativo',
  name: nameExpression,
  order: 'module.ordem',
};

@Injectable()
export class SystemModulesRepository {
  constructor(
    @InjectRepository(SystemModule) private readonly modules: Repository<SystemModule>,
    @InjectRepository(Language) private readonly languages: Repository<Language>,
    @InjectRepository(Functionality) private readonly functionalities: Repository<Functionality>,
  ) {}

  list(
    clientId: number,
    request: PaginateRequest,
    locale: string,
  ): Promise<[SystemModule[], number]> {
    const query = this.modules
      .createQueryBuilder('module')
      .leftJoinAndSelect('module.translations', 'translations')
      .leftJoinAndSelect('translations.language', 'translationLanguage')
      .where('module.cliente_id = :clientId', { clientId })
      .setParameters(buildTranslationQueryParameters(locale));

    return applyPaginatedQueryBuilder<SystemModule>(query, request, {
      defaultSort: [{ field: 'order', direction: 'asc' }],
      fields: LIST_FIELDS,
      tieBreaker: 'module.id',
    });
  }

  findById(clientId: number, id: number): Promise<SystemModule | null> {
    return this.modules.findOne({
      where: { id, client: { id: clientId } },
      relations: { translations: { language: true } },
    });
  }

  findByIds(clientId: number, ids: number[]): Promise<SystemModule[]> {
    return this.modules.find({ where: { client: { id: clientId }, id: In(ids) } });
  }

  findLanguagesByCodes(codes: string[]): Promise<Language[]> {
    return this.languages.find({ where: { languageCode: In(codes) } });
  }

  async save(
    module: DeepPartial<SystemModule> & { translations: DeepPartial<SystemModuleTranslation>[] },
  ): Promise<SystemModule> {
    return this.modules.save(module);
  }

  hasFunctionalities(ids: number[]): Promise<boolean> {
    return this.functionalities.exists({ where: { module: { id: In(ids) } } });
  }

  async delete(modules: SystemModule[]): Promise<number[]> {
    const ids = modules.map((module) => module.id);
    await this.modules.remove(modules);
    return ids;
  }
}
