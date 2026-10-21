import type { PaginatedBody } from '@contenster/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import type { I18nTranslations } from '@/i18n/translations';
import { SessionSynchronizationService } from '@/modules/identity/authentication/session/session-synchronization.service';
import {
  type DeleteRecordsRequestDto,
  DeleteRecordsResponseDto,
  normalizeDeleteRecordIds,
  type PaginateRequestDto,
} from '@/shared/dtos';
import { buildPaginationMeta } from '@/shared/pagination';
import { toResponseDto } from '@/shared/responses';

import type { SaveLanguageRequestDto } from './dto/req/save-language-request.js';
import { GetLanguageByIdResponseDto } from './dto/res/get-language-by-id-response.js';
import { LanguageListItemResponseDto } from './dto/res/language-list-item-response.js';
import type { Language } from './entities/language.entity';
import { LanguagesRepository } from './languages.repository';

@Injectable()
export class LanguagesService {
  constructor(
    private readonly repository: LanguagesRepository,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly sessionSynchronizationService: SessionSynchronizationService,
  ) {}

  async list(request: PaginateRequestDto): Promise<PaginatedBody<LanguageListItemResponseDto>> {
    const [languages, total] = await this.repository.list(request);

    return {
      items: toResponseDto(
        LanguageListItemResponseDto,
        languages.map((language) => this.toListItem(language)),
      ),
      meta: buildPaginationMeta(request, total),
    };
  }

  async getById(id: number): Promise<GetLanguageByIdResponseDto> {
    return toResponseDto(
      GetLanguageByIdResponseDto,
      this.toListItem(await this.getEntityByIdOrFail(id)),
    );
  }

  async save(request: SaveLanguageRequestDto): Promise<GetLanguageByIdResponseDto> {
    const language = await this.repository.save({
      ...(request.id === null ? {} : { id: request.id }),
      name: request.name,
      languageCode: request.languageCode,
      regionCode: request.regionCode,
      icon: request.iconId === null ? null : { id: request.iconId },
    });

    await this.synchronizeSessions();

    return this.getById(language.id);
  }

  async delete(request: DeleteRecordsRequestDto): Promise<DeleteRecordsResponseDto> {
    const ids = normalizeDeleteRecordIds(request, this.i18n.t('validation.invalid_delete_request'));
    const languages = await this.repository.findByIds(ids);

    if (languages.length !== ids.length) {
      throw new NotFoundException(this.i18n.t('errors.common.record_not_found'));
    }

    return toResponseDto(DeleteRecordsResponseDto, {
      ids: await this.repository.delete(languages),
    });
  }

  private async getEntityByIdOrFail(id: number): Promise<Language> {
    const language = await this.repository.findById(id);

    if (!language) {
      throw new NotFoundException(this.i18n.t('errors.common.record_not_found'));
    }

    return language;
  }

  private toListItem(language: Language) {
    return {
      id: language.id,
      name: language.name,
      languageCode: language.languageCode,
      regionCode: language.regionCode,
      iconId: language.icon?.id ?? null,
    };
  }

  private async synchronizeSessions(): Promise<void> {
    await this.sessionSynchronizationService.synchronizeAll();
  }
}
