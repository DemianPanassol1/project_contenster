import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { DataSource, type DeepPartial, In, Repository } from 'typeorm';

import { CORE_FUNCTIONALITY_CATALOG, type PaginateRequest } from '@contenster/shared';
import type { I18nTranslations } from '@/i18n/translations';
import { Functionality } from '@/modules/access-control/functionalities/entities/functionality.entity';
import { SystemModule } from '@/modules/access-control/modules/entities/system-module.entity';
import { ProfilePermission } from '@/modules/access-control/profiles/entities/profile-permission.entity';
import { Profile } from '@/modules/access-control/profiles/entities/profiles.entity';
import { Action } from '@/modules/authorization/actions/entities/action.entity';
import { Language } from '@/modules/communication/languages/entities/language.entity';
import type { SaveClientRequestDto } from '@/modules/identity/clients/dto/req/save-client.request.dto';
import { Client } from '@/modules/identity/clients/entities/client.entity';
import { User } from '@/modules/identity/users/entities/user.entity';
import { UserProfile } from '@/modules/identity/users/entities/user-profile.entity';
import { buildPaginationMeta } from '@/shared/pagination';

import type { CreateSystemAdminClientRequest } from './types/system-admin.types';
import { SystemAdminRepository } from './system-admin.repository';

@Injectable()
export class SystemAdminService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(UserProfile) private readonly userProfiles: Repository<UserProfile>,
    @InjectRepository(Profile) private readonly profiles: Repository<Profile>,
    @InjectRepository(Language) private readonly languages: Repository<Language>,
    private readonly dataSource: DataSource,
    private readonly repository: SystemAdminRepository,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  listClients() {
    return this.repository.listClients();
  }

  async updateClient(id: number, request: SaveClientRequestDto) {
    const client = await this.repository.findClientWithLanguages(id);

    if (!client || request.id !== id) {
      throw this.clientNotFound();
    }

    const languages = await this.languages.find({
      where: { id: In(request.languageLinks.map(({ languageId }) => languageId)) },
    });

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

    return this.repository.saveClient(client);
  }

  async createClient(request: CreateSystemAdminClientRequest) {
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

      const languages = await manager.find(Language, { where: { id: In(languageIds) } });

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

      const client = await manager.save(Client, {
        ...clientData,
        city: cityId === null ? null : { id: cityId },
        image: imageId === null ? null : { id: imageId },
        availableLanguageLinks: request.client.languageLinks.map(({ languageId }) => ({
          language: languageById.get(languageId)!,
        })),
      });

      const moduleByKey = new Map<string, SystemModule>();

      for (const item of request.modules) {
        const module = await manager.save(SystemModule, {
          client,
          order: item.order,
          isActive: true,
          translations: item.translations.map((translation) => ({
            ...translation,
            language: languageByCode.get(translation.locale)!,
          })),
        });

        moduleByKey.set(item.key, module);
      }

      const functionalityBySlug = new Map<string, Functionality>();
      const pending = [...request.functionalities];

      while (pending.length > 0) {
        const index = pending.findIndex(
          (item) => item.parentSlug === null || functionalityBySlug.has(item.parentSlug),
        );
        if (index === -1) {
          throw new NotFoundException(
            this.i18n.t('errors.system_admin.invalid_functionality_hierarchy'),
          );
        }

        const item = pending.splice(index, 1)[0];
        const module = moduleByKey.get(item.moduleKey);

        if (!module || item.languageIds.some((id) => !languageById.has(id))) {
          throw new NotFoundException(
            this.i18n.t('errors.system_admin.invalid_functionality_configuration'),
          );
        }

        const functionality = await manager.save(Functionality, {
          client,
          module,
          parent: item.parentSlug === null ? null : functionalityBySlug.get(item.parentSlug)!,
          slug: item.slug,
          icon: item.icon,
          order: item.order,
          isNavigationGroup: item.isNavigationGroup,
          isActive: true,
          translations: item.translations.map((translation) => ({
            ...translation,
            language: languageByCode.get(translation.locale)!,
          })),
          enabledLanguageLinks: item.languageIds.map((id) => ({
            client,
            language: languageById.get(id)!,
          })),
        });

        functionalityBySlug.set(item.slug, functionality);
      }

      const profile = await manager.save(Profile, {
        client,
        isActive: true,
        isAdmin: true,
        translations: request.adminProfile.translations.map((translation) => ({
          ...translation,
          language: languageByCode.get(translation.locale)!,
        })),
      });

      const actions = await manager.find(Action);
      const permissions: DeepPartial<ProfilePermission>[] = [
        ...functionalityBySlug.values(),
      ].flatMap((functionality) => actions.map((action) => ({ profile, functionality, action })));

      await manager.save(ProfilePermission, permissions);

      return client;
    });
  }

  async setClientActive(id: number, isActive: boolean) {
    const client = await this.repository.findClient(id);

    if (!client) {
      throw this.clientNotFound();
    }

    client.isActive = isActive;

    return this.repository.saveClient(client);
  }

  async deleteClient(id: number) {
    const client = await this.repository.findClient(id);

    if (!client) {
      throw this.clientNotFound();
    }

    await this.repository.softDeleteClient(client);

    return { id };
  }

  listRequestLogs(clientId?: number) {
    return this.repository.listRequestLogs(clientId);
  }

  async listRequestLogsPaginated(request: PaginateRequest) {
    const [items, total] = await this.repository.listRequestLogsPaginated(request);
    return { items, meta: buildPaginationMeta(request, total) };
  }

  listJobLogs() {
    return this.repository.listJobLogs();
  }

  async listJobLogsPaginated(request: PaginateRequest) {
    const [items, total] = await this.repository.listJobLogsPaginated(request);
    return { items, meta: buildPaginationMeta(request, total) };
  }

  listFiles(clientId?: number) {
    return this.repository.listFiles(clientId);
  }

  async listFilesPaginated(request: PaginateRequest) {
    const [items, total] = await this.repository.listFilesPaginated(request);
    return { items, meta: buildPaginationMeta(request, total) };
  }

  async assignUserProfile(userId: number, clientId: number, profileId: number) {
    const [user, client, profile] = await Promise.all([
      this.users.findOneBy({ id: userId }),
      this.repository.findActiveClient(clientId),
      this.profiles.findOneBy({ id: profileId, client: { id: clientId }, isActive: true }),
    ]);

    if (!user || !client || !profile) {
      throw new NotFoundException(
        this.i18n.t('errors.system_admin.invalid_user_profile_assignment'),
      );
    }

    return this.userProfiles.save({
      user: { id: userId },
      client: { id: clientId },
      profile: { id: profileId },
    });
  }

  private clientNotFound(): NotFoundException {
    return new NotFoundException(this.i18n.t('errors.system_admin.client_not_found'));
  }

  private clientLanguageNotFound(): NotFoundException {
    return new NotFoundException(this.i18n.t('errors.system_admin.language_not_found'));
  }
}
