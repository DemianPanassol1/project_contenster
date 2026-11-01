import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { DataSource } from 'typeorm';

import {
  CORE_FUNCTIONALITY_CATALOG,
  type CreateSystemAdminClientRequest,
  type PaginatedBody,
  type PaginateRequest,
  type SystemAdminClientListItem,
} from '@contenster/shared';
import type { I18nTranslations } from '@/i18n/translations';
import { SessionSynchronizationService } from '@/modules/core/identity/authentication/session/session-synchronization.service';
import type { SaveClientRequestDto } from '@/modules/core/identity/clients/dto/req/save-client.request.dto';
import type { Client } from '@/modules/core/identity/clients/entities/client.entity';
import { resolveFilePublicUrl } from '@/modules/core/media/files/helpers/file-public-url.helper';
import { buildPaginationMeta } from '@/shared/pagination';
import { toResponseDto } from '@/shared/responses';

import { SystemAdminClientListItemResponseDto } from './dto/res/system-admin-client-list-item.response.dto';
import { ClientsRepository } from './clients.repository';

@Injectable()
export class ClientsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly repository: ClientsRepository,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly sessionSynchronizationService: SessionSynchronizationService,
  ) {}

  async list(
    request: PaginateRequest,
  ): Promise<PaginatedBody<SystemAdminClientListItemResponseDto>> {
    const [clients, total] = await this.repository.list(request);
    const counts = await this.repository.countUsersByClientIds(clients.map((client) => client.id));

    return {
      items: toResponseDto(
        SystemAdminClientListItemResponseDto,
        clients.map((client) => this.toListItem(client, counts.get(client.id) ?? 0)),
      ),
      meta: buildPaginationMeta(request, total),
    };
  }

  async update(id: number, request: SaveClientRequestDto): Promise<Client> {
    const client = await this.repository.findWithLanguages(id);

    if (!client || request.id !== id) {
      throw this.clientNotFound();
    }

    const languages = await this.repository.findLanguagesByIds(
      request.languageLinks.map(({ languageId }) => languageId),
    );

    if (languages.length !== request.languageLinks.length) {
      throw this.clientLanguageNotFound();
    }

    Object.assign(client, {
      corporateName: request.corporateName,
      tradeName: request.tradeName,
      document: request.document,
      documentType: request.documentType,
      email: request.email,
      primaryPhone: request.primaryPhone,
      secondaryPhone: request.secondaryPhone,
      address: request.address,
      addressNumber: request.addressNumber,
      zipCode: request.zipCode,
      neighborhood: request.neighborhood,
      slug: request.slug,
      isActive: request.isActive,
      city: request.cityId === null ? null : { id: request.cityId },
      image: request.imageId === null ? null : { id: request.imageId },
      availableLanguageLinks: languages.map((language) => ({ language })),
    });

    const saved = await this.repository.save(client);

    await this.sessionSynchronizationService.synchronizeAll();

    return saved;
  }

  async create(request: CreateSystemAdminClientRequest): Promise<Client> {
    const catalogSlugs = new Set<string>(CORE_FUNCTIONALITY_CATALOG.map(({ slug }) => slug));

    if (request.functionalities.some(({ slug }) => !catalogSlugs.has(slug))) {
      throw new NotFoundException(this.i18n.t('errors.system_admin.functionality_not_in_catalog'));
    }

    if (
      new Set(request.functionalities.map(({ slug }) => slug)).size !==
      request.functionalities.length
    ) {
      throw new NotFoundException(this.i18n.t('errors.system_admin.functionality_duplicate'));
    }

    return this.dataSource.transaction(async (manager) => {
      const languageIds = [
        ...new Set(request.client.languageLinks.map(({ languageId }) => languageId)),
      ];
      const languages = await this.repository.findLanguagesByIds(languageIds, manager);

      if (languages.length !== languageIds.length) {
        throw this.clientLanguageNotFound();
      }

      const languageById = new Map(languages.map((language) => [language.id, language]));
      const languageByCode = new Map(
        languages.map((language) => [language.languageCode, language]),
      );
      const {
        cityId,
        id: _id,
        imageId,
        languageLinks: _languageLinks,
        ...clientData
      } = request.client;

      const client = await this.repository.saveClient(
        {
          ...clientData,
          city: cityId === null ? null : { id: cityId },
          image: imageId === null ? null : { id: imageId },
          availableLanguageLinks: request.client.languageLinks.map(({ languageId }) => ({
            language: languageById.get(languageId)!,
          })),
        },
        manager,
      );
      const modules = new Map<string, Awaited<ReturnType<ClientsRepository['saveModule']>>>();

      for (const item of request.modules) {
        modules.set(
          item.key,
          await this.repository.saveModule(
            {
              client,
              order: item.order,
              isActive: true,
              translations: item.translations.map((translation) => ({
                ...translation,
                language: languageByCode.get(translation.locale)!,
              })),
            },
            manager,
          ),
        );
      }

      const functionalities = new Map<
        string,
        Awaited<ReturnType<ClientsRepository['saveFunctionality']>>
      >();
      const pending = [...request.functionalities];

      while (pending.length) {
        const index = pending.findIndex(
          (item) => item.parentSlug === null || functionalities.has(item.parentSlug),
        );
        if (index === -1) {
          throw new NotFoundException(
            this.i18n.t('errors.system_admin.invalid_functionality_hierarchy'),
          );
        }

        const item = pending.splice(index, 1)[0];
        const module = modules.get(item.moduleKey);

        if (!module || item.languageIds.some((languageId) => !languageById.has(languageId))) {
          throw new NotFoundException(
            this.i18n.t('errors.system_admin.invalid_functionality_configuration'),
          );
        }

        functionalities.set(
          item.slug,
          await this.repository.saveFunctionality(
            {
              client,
              module,
              parent: item.parentSlug === null ? null : functionalities.get(item.parentSlug)!,
              slug: item.slug,
              icon: item.icon,
              order: item.order,
              isNavigationGroup: item.isNavigationGroup,
              isActive: true,
              translations: item.translations.map((translation) => ({
                ...translation,
                language: languageByCode.get(translation.locale)!,
              })),
              enabledLanguageLinks: item.languageIds.map((languageId) => ({
                client,
                language: languageById.get(languageId)!,
              })),
            },
            manager,
          ),
        );
      }

      const profile = await this.repository.saveProfile(
        {
          client,
          isActive: true,
          isAdmin: true,
          translations: request.adminProfile.translations.map((translation) => ({
            ...translation,
            language: languageByCode.get(translation.locale)!,
          })),
        },
        manager,
      );
      const actions = await this.repository.findActions(manager);

      await this.repository.saveProfilePermissions(
        [...functionalities.values()].flatMap((functionality) =>
          actions.map((action) => ({ profile, functionality, action })),
        ),
        manager,
      );

      return client;
    });
  }

  async setActive(id: number, isActive: boolean): Promise<Client> {
    const client = await this.repository.findById(id);

    if (!client) {
      throw this.clientNotFound();
    }

    client.isActive = isActive;

    const saved = await this.repository.save(client);

    await this.sessionSynchronizationService.synchronizeAll();

    return saved;
  }

  async delete(id: number): Promise<{ id: number }> {
    const client = await this.repository.findById(id);

    if (!client) {
      throw this.clientNotFound();
    }

    await this.repository.softDelete(client);

    await this.sessionSynchronizationService.synchronizeAll();

    return { id };
  }

  private toListItem(client: Client, userCount: number): SystemAdminClientListItem {
    return {
      corporateName: client.corporateName,
      document: client.document,
      documentType: client.documentType,
      id: client.id,
      imageUrl: resolveFilePublicUrl(client.image),
      isActive: client.isActive,
      tradeName: client.tradeName,
      userCount,
    };
  }

  private clientNotFound(): NotFoundException {
    return new NotFoundException(this.i18n.t('errors.system_admin.client_not_found'));
  }

  private clientLanguageNotFound(): NotFoundException {
    return new NotFoundException(this.i18n.t('errors.system_admin.language_not_found'));
  }
}
