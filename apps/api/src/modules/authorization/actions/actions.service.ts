import type { PaginatedBody } from '@contenster/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { I18nService } from 'nestjs-i18n';

import type { I18nTranslations } from '@/i18n/translations';
import { SessionSynchronizationService } from '@/modules/identity/authentication/session/session-synchronization.service';
import {
  type DeleteRecordsRequestDto,
  DeleteRecordsResponseDto,
  normalizeDeleteRecordIds,
  type PaginateRequestDto,
} from '@/shared/dtos';
import { getCurrentLocale } from '@/shared/i18n';
import { buildPaginationMeta } from '@/shared/pagination';
import { toResponseDto } from '@/shared/responses';
import { resolveTranslation, resolveTranslationLanguages } from '@/shared/translations';

import type { SaveActionRequestDto } from './dto/req/save-action-request.js';
import { ActionListItemResponseDto } from './dto/res/action-list-item-response.js';
import { GetActionByIdResponseDto } from './dto/res/get-action-by-id-response.js';
import type { Action } from './entities/action.entity';
import { ActionsRepository } from './actions.repository';

@Injectable()
export class ActionsService {
  constructor(
    private readonly repository: ActionsRepository,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly sessionSynchronizationService: SessionSynchronizationService,
  ) {}

  async list(request: PaginateRequestDto): Promise<PaginatedBody<ActionListItemResponseDto>> {
    const locale = getCurrentLocale();
    const [actions, total] = await this.repository.list(request, locale);

    return {
      items: toResponseDto(
        ActionListItemResponseDto,
        actions.map((action) => this.toListItem(action, locale)),
      ),
      meta: buildPaginationMeta(request, total),
    };
  }

  async getById(id: number): Promise<GetActionByIdResponseDto> {
    const locale = getCurrentLocale();
    const action = await this.getEntityByIdOrFail(id);

    return toResponseDto(GetActionByIdResponseDto, {
      ...this.toListItem(action, locale),
      translations: action.translations.map((translation) => ({
        id: translation.id,
        locale: translation.language.languageCode,
        name: translation.name,
        description: translation.description,
      })),
    });
  }

  async save(request: SaveActionRequestDto): Promise<GetActionByIdResponseDto> {
    const languages = await this.repository.findLanguagesByCodes(
      request.translations.map((translation) => translation.locale),
    );
    const languageByCode = resolveTranslationLanguages(
      request.translations.map((translation) => translation.locale),
      languages,
    );

    const action = await this.repository.save({
      ...(request.id === null ? {} : { id: request.id }),
      type: request.type,
      translations: request.translations.map((translation) => ({
        ...(translation.id === null ? {} : { id: translation.id }),
        language: languageByCode.get(translation.locale)!,
        name: translation.name,
        description: translation.description,
      })),
    });

    await this.sessionSynchronizationService.synchronizeAll();

    return this.getById(action.id);
  }

  async delete(request: DeleteRecordsRequestDto): Promise<DeleteRecordsResponseDto> {
    const ids = normalizeDeleteRecordIds(request, this.i18n.t('validation.invalid_delete_request'));
    const actions = await this.repository.findByIds(ids);

    if (actions.length !== ids.length) {
      throw new NotFoundException(this.i18n.t('errors.common.record_not_found'));
    }

    const result = await this.repository.delete(actions);

    await this.sessionSynchronizationService.synchronizeAll();

    return toResponseDto(DeleteRecordsResponseDto, { ids: result });
  }

  private async getEntityByIdOrFail(id: number): Promise<Action> {
    const action = await this.repository.findById(id);

    if (!action) {
      throw new NotFoundException(this.i18n.t('errors.common.record_not_found'));
    }

    return action;
  }

  private toListItem(action: Action, locale: string) {
    return {
      id: action.id,
      type: action.type,
      name: resolveTranslation(action.translations, locale, 'name'),
      description: resolveTranslation(action.translations, locale, 'description'),
    };
  }
}
