import type { AppOption, PaginatedBody } from '@contenster/shared';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import type { I18nTranslations } from '@/i18n/translations';
import { SystemModulesRepository } from '@/modules/access-control/modules/system-module.repository';
import { SessionSynchronizationService } from '@/modules/identity/authentication/session/session-synchronization.service';
import { ClientsRepository } from '@/modules/identity/clients/clients.repository';
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

import type { SaveFunctionalityRequestDto } from './dto/req/save-functionality-request.js';
import { FunctionalityListItemResponseDto } from './dto/res/functionality-list-item-response.js';
import { GetFunctionalityByIdResponseDto } from './dto/res/get-functionality-by-id-response.js';
import type { Functionality } from './entities/functionality.entity';
import { FunctionalityRepository } from './functionality.repository';

@Injectable()
export class FunctionalityService {
  constructor(
    private readonly repository: FunctionalityRepository,
    private readonly modulesRepository: SystemModulesRepository,
    private readonly clientsRepository: ClientsRepository,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly sessionSynchronizationService: SessionSynchronizationService,
  ) {}

  async list(
    clientId: number,
    request: PaginateRequestDto,
  ): Promise<PaginatedBody<FunctionalityListItemResponseDto>> {
    const locale = getCurrentLocale();
    const [functionalities, total] = await this.repository.list(clientId, request, locale);

    return {
      items: toResponseDto(
        FunctionalityListItemResponseDto,
        functionalities.map((functionality) => this.toListItem(functionality, locale)),
      ),
      meta: buildPaginationMeta(request, total),
    };
  }

  async listModuleOptions(clientId: number, request: PaginateRequestDto): Promise<AppOption[]> {
    const locale = getCurrentLocale();
    const [modules] = await this.modulesRepository.list(clientId, request, locale);

    return modules.map((module) => ({
      disabled: !module.isActive,
      label: resolveTranslation(module.translations, locale, 'name'),
      metadata: null,
      value: module.id,
    }));
  }

  async listParentOptions(clientId: number, request: PaginateRequestDto): Promise<AppOption[]> {
    const locale = getCurrentLocale();
    const [functionalities] = await this.repository.list(clientId, request, locale);

    return functionalities.map((functionality) => ({
      disabled: !functionality.isActive,
      label: resolveTranslation(functionality.translations, locale, 'name'),
      metadata: null,
      value: functionality.id,
    }));
  }

  async listLanguageOptions(clientId: number, request: PaginateRequestDto): Promise<AppOption[]> {
    const [languages] = await this.clientsRepository.listAvailableLanguages(clientId, request);

    return languages.map((language) => ({
      disabled: false,
      label: language.name,
      metadata: { locale: language.languageCode },
      value: language.id,
    }));
  }

  async getById(clientId: number, id: number): Promise<GetFunctionalityByIdResponseDto> {
    const locale = getCurrentLocale();
    const functionality = await this.getEntityByIdOrFail(clientId, id);

    return toResponseDto(GetFunctionalityByIdResponseDto, {
      ...this.toListItem(functionality, locale),
      clientId,
      translations: functionality.translations.map((translation) => ({
        id: translation.id,
        locale: translation.language.languageCode,
        name: translation.name,
        description: translation.description,
      })),
      languageLinks: functionality.enabledLanguageLinks.map((link) => ({
        id: link.id,
        languageId: link.language.id,
      })),
    });
  }

  async save(
    clientId: number,
    request: SaveFunctionalityRequestDto,
  ): Promise<GetFunctionalityByIdResponseDto> {
    if (request.id !== null) {
      await this.getEntityByIdOrFail(clientId, request.id);
    }

    const module = await this.repository.findModule(clientId, request.moduleId);
    if (!module) {
      throw new BadRequestException(this.i18n.t('errors.common.record_not_found'));
    }

    const parent =
      request.parentId === null
        ? null
        : await this.repository.findParent(clientId, request.parentId);
    if (request.parentId !== null && !parent) {
      throw new BadRequestException(this.i18n.t('errors.common.record_not_found'));
    }

    if (parent?.id === request.id) {
      throw new BadRequestException(this.i18n.t('errors.common.record_not_found'));
    }

    const languageIds = request.languageLinks.map((link) => link.languageId);

    if (languageIds.length === 0) {
      throw new BadRequestException(
        this.i18n.t('errors.access_control.functionality_language_required'),
      );
    }

    if (new Set(languageIds).size !== languageIds.length) {
      throw new BadRequestException(this.i18n.t('errors.translations.language_not_found'));
    }

    const languages = await this.clientsRepository.findAvailableLanguagesByIds(
      clientId,
      languageIds,
    );

    if (languages.length !== languageIds.length) {
      throw new BadRequestException(
        this.i18n.t('errors.access_control.functionality_language_not_available'),
      );
    }

    const languageByCode = resolveTranslationLanguages(
      request.translations.map((translation) => translation.locale),
      languages,
    );

    const functionality = await this.repository.save({
      ...(request.id === null ? {} : { id: request.id }),
      client: { id: clientId },
      module,
      parent,
      slug: request.slug,
      icon: request.icon,
      order: request.order,
      isNavigationGroup: request.isNavigationGroup,
      isActive: request.isActive,
      translations: request.translations.map((translation) => ({
        ...(translation.id === null ? {} : { id: translation.id }),
        language: languageByCode.get(translation.locale)!,
        name: translation.name,
        description: translation.description,
      })),
      enabledLanguageLinks: request.languageLinks.map((link) => ({
        ...(link.id === null ? {} : { id: link.id }),
        client: { id: clientId },
        language: { id: link.languageId },
      })),
    });

    await this.sessionSynchronizationService.synchronizeAll();

    return this.getById(clientId, functionality.id);
  }

  async delete(
    clientId: number,
    request: DeleteRecordsRequestDto,
  ): Promise<DeleteRecordsResponseDto> {
    const ids = normalizeDeleteRecordIds(request, this.i18n.t('validation.invalid_delete_request'));
    const functionalities = await this.repository.findByIds(clientId, ids);

    if (functionalities.length !== ids.length) {
      throw new NotFoundException(this.i18n.t('errors.common.record_not_found'));
    }

    if (await this.repository.hasChildren(ids)) {
      throw new ConflictException(this.i18n.t('errors.common.record_not_found'));
    }

    const result = await this.repository.delete(functionalities);

    await this.sessionSynchronizationService.synchronizeAll();

    return toResponseDto(DeleteRecordsResponseDto, { ids: result });
  }

  private async getEntityByIdOrFail(clientId: number, id: number): Promise<Functionality> {
    const functionality = await this.repository.findById(clientId, id);
    if (!functionality) {
      throw new NotFoundException(this.i18n.t('errors.common.record_not_found'));
    }

    return functionality;
  }

  private toListItem(functionality: Functionality, locale: string) {
    return {
      id: functionality.id,
      moduleId: functionality.module.id,
      parentId: functionality.parent?.id ?? null,
      slug: functionality.slug,
      icon: functionality.icon,
      order: functionality.order,
      isNavigationGroup: functionality.isNavigationGroup,
      isActive: functionality.isActive,
      name: resolveTranslation(functionality.translations, locale, 'name'),
      description: resolveTranslation(functionality.translations, locale, 'description'),
    };
  }
}
