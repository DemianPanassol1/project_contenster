import type { PaginatedBody } from '@contenster/shared';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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

import type { SaveSystemModuleRequestDto } from './dto/req/save-system-module-request.js';
import { GetSystemModuleByIdResponseDto } from './dto/res/get-system-module-by-id-response.js';
import { SystemModuleListItemResponseDto } from './dto/res/system-module-list-item-response.js';
import type { SystemModule } from './entities/system-module.entity';
import { SystemModulesRepository } from './system-module.repository';

@Injectable()
export class SystemModulesService {
  constructor(
    private readonly repository: SystemModulesRepository,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly sessionSynchronizationService: SessionSynchronizationService,
  ) {}

  async list(
    clientId: number,
    request: PaginateRequestDto,
  ): Promise<PaginatedBody<SystemModuleListItemResponseDto>> {
    const locale = getCurrentLocale();
    const [modules, total] = await this.repository.list(clientId, request, locale);

    return {
      items: toResponseDto(
        SystemModuleListItemResponseDto,
        modules.map((module) => this.toListItem(module, locale)),
      ),
      meta: buildPaginationMeta(request, total),
    };
  }

  async getById(clientId: number, id: number): Promise<GetSystemModuleByIdResponseDto> {
    const module = await this.getEntityByIdOrFail(clientId, id);
    const locale = getCurrentLocale();

    return toResponseDto(GetSystemModuleByIdResponseDto, {
      ...this.toListItem(module, locale),
      translations: module.translations.map((translation) => ({
        id: translation.id,
        locale: translation.language.languageCode,
        name: translation.name,
        description: translation.description,
      })),
    });
  }

  async save(
    clientId: number,
    request: SaveSystemModuleRequestDto,
  ): Promise<GetSystemModuleByIdResponseDto> {
    if (request.id !== null) {
      await this.getEntityByIdOrFail(clientId, request.id);
    }

    const languages = await this.repository.findLanguagesByCodes(
      request.translations.map((translation) => translation.locale),
    );
    const languageByCode = resolveTranslationLanguages(
      request.translations.map((translation) => translation.locale),
      languages,
    );

    const module = await this.repository.save({
      ...(request.id === null ? {} : { id: request.id }),
      client: { id: clientId },
      order: request.order,
      isActive: request.isActive,
      translations: request.translations.map((translation) => ({
        ...(translation.id === null ? {} : { id: translation.id }),
        language: languageByCode.get(translation.locale)!,
        name: translation.name,
        description: translation.description,
      })),
    });

    await this.sessionSynchronizationService.synchronizeAll();

    return this.getById(clientId, module.id);
  }

  async delete(
    clientId: number,
    request: DeleteRecordsRequestDto,
  ): Promise<DeleteRecordsResponseDto> {
    const ids = normalizeDeleteRecordIds(request, this.i18n.t('validation.invalid_delete_request'));
    const modules = await this.repository.findByIds(clientId, ids);

    if (modules.length !== ids.length) {
      throw new NotFoundException(this.i18n.t('errors.common.record_not_found'));
    }

    if (await this.repository.hasFunctionalities(ids)) {
      throw new ConflictException(this.i18n.t('errors.common.record_not_found'));
    }

    const result = await this.repository.delete(modules);

    await this.sessionSynchronizationService.synchronizeAll();

    return toResponseDto(DeleteRecordsResponseDto, { ids: result });
  }

  private async getEntityByIdOrFail(clientId: number, id: number): Promise<SystemModule> {
    const module = await this.repository.findById(clientId, id);
    if (!module) {
      throw new NotFoundException(this.i18n.t('errors.common.record_not_found'));
    }

    return module;
  }

  private toListItem(module: SystemModule, locale: string) {
    return {
      id: module.id,
      order: module.order,
      isActive: module.isActive,
      name: resolveTranslation(module.translations, locale, 'name'),
      description: resolveTranslation(module.translations, locale, 'description'),
    };
  }
}
