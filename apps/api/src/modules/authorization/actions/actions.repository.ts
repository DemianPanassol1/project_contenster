import type { PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type DeepPartial, In, Repository } from 'typeorm';

import { Language } from '@/modules/communication/languages/entities/language.entity';
import { applyPaginatedQueryBuilder, type QueryFieldMap } from '@/shared/pagination';
import {
  buildTranslatedLabelExpression,
  buildTranslationQueryParameters,
} from '@/shared/translations';

import { Action } from './entities/action.entity';
import { ActionTranslation } from './entities/action-translation.entity';

const nameExpression = buildTranslatedLabelExpression({
  fieldColumn: 'nome',
  ownerColumn: 'acao_id',
  ownerExpression: 'action.id',
  table: 'acoes_traducoes',
  uniqueAlias: 'action_name',
});

const LIST_FIELDS: QueryFieldMap = { id: 'action.id', name: nameExpression, type: 'action.tipo' };

@Injectable()
export class ActionsRepository {
  constructor(
    @InjectRepository(Action) private readonly actions: Repository<Action>,
    @InjectRepository(Language) private readonly languages: Repository<Language>,
  ) {}

  list(request: PaginateRequest, locale: string): Promise<[Action[], number]> {
    const query = this.actions
      .createQueryBuilder('action')
      .leftJoinAndSelect('action.translations', 'translations')
      .leftJoinAndSelect('translations.language', 'translationLanguage')
      .setParameters(buildTranslationQueryParameters(locale));
    return applyPaginatedQueryBuilder<Action>(query, request, {
      defaultSort: [{ field: 'name', direction: 'asc' }],
      fields: LIST_FIELDS,
      tieBreaker: 'action.id',
    });
  }

  findById(id: number): Promise<Action | null> {
    return this.actions.findOne({ where: { id }, relations: { translations: { language: true } } });
  }

  findByIds(ids: number[]): Promise<Action[]> {
    return this.actions.findBy({ id: In(ids) });
  }

  findLanguagesByCodes(codes: string[]): Promise<Language[]> {
    return this.languages.find({ where: { languageCode: In(codes) } });
  }

  async save(
    action: DeepPartial<Action> & { translations: DeepPartial<ActionTranslation>[] },
  ): Promise<Action> {
    return this.actions.save(action);
  }

  async delete(actions: Action[]): Promise<number[]> {
    const ids = actions.map((action) => action.id);
    await this.actions.remove(actions);
    return ids;
  }
}
