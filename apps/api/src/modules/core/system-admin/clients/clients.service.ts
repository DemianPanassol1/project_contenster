import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { DataSource, type EntityManager } from 'typeorm';

import {
  type AppOption,
  type FileResponse,
  type GetSystemAdminClientResponse,
  type PaginatedBody,
  type PaginateRequest,
  type SaveSystemAdminClientRequest,
  type SystemAdminClientListItem,
} from '@contenster/shared';
import type { I18nTranslations } from '@/i18n/translations';
import { SessionSynchronizationService } from '@/modules/core/identity/authentication/session/session-synchronization.service';
import { ClientsService as IdentityClientsService } from '@/modules/core/identity/clients/clients.service';
import type { Client } from '@/modules/core/identity/clients/entities/client.entity';
import { CitiesRepository } from '@/modules/core/locations/cities/cities.repository';
import { ClientStorageService } from '@/modules/core/media/client-storage/client-storage.service';
import { StorageProviderConfiguration } from '@/modules/core/media/files/entities/storage-provider-configuration.entity';
import { FileService } from '@/modules/core/media/files/file.service';
import { resolveFilePublicUrl } from '@/modules/core/media/files/helpers/file-public-url.helper';
import type { UploadedMultipartFile } from '@/modules/core/media/files/types/uploaded-multipart-file.type';
import { LanguagesRepository } from '@/modules/core/system-admin/languages/languages.repository';
import { isPostgreSqlForeignKeyViolation } from '@/shared/database/postgres-error.helper';
import type { PaginateRequestDto } from '@/shared/dtos';
import { getCurrentLocale } from '@/shared/i18n';
import { buildPaginationMeta } from '@/shared/pagination';
import { toResponseDto } from '@/shared/responses';
import { resolveTranslation } from '@/shared/translations';

import { SystemAdminClientListItemResponseDto } from './dto/res/system-admin-client-list-item.response.dto';
import { ClientsRepository } from './clients.repository';

@Injectable()
export class ClientsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly repository: ClientsRepository,
    private readonly citiesRepository: CitiesRepository,
    private readonly languagesRepository: LanguagesRepository,
    private readonly clientStorageService: ClientStorageService,
    private readonly identityClientsService: IdentityClientsService,
    private readonly fileService: FileService,
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

  async get(id: number): Promise<GetSystemAdminClientResponse> {
    const client = await this.repository.findAggregate(id);

    if (!client) {
      throw this.clientNotFound();
    }

    return this.toAggregateResponse(client);
  }

  async listCityOptions(request: PaginateRequestDto): Promise<AppOption[]> {
    const locale = getCurrentLocale();
    const [cities] = await this.citiesRepository.list(request, locale);

    return cities.map((city) => ({
      disabled: !city.isActive,
      label: `${resolveTranslation(city.translations, locale, 'name')} - ${resolveTranslation(
        city.state.translations,
        locale,
        'name',
      )}, ${resolveTranslation(city.state.country.translations, locale, 'name')}`,
      metadata: null,
      value: city.id,
    }));
  }

  async listLanguageOptions(request: PaginateRequestDto): Promise<AppOption[]> {
    const [languages] = await this.languagesRepository.list(request);

    return languages.map((language) => ({
      disabled: false,
      label: language.name,
      metadata: { locale: language.languageCode },
      value: language.id,
    }));
  }

  getImageById(id: number): Promise<FileResponse> {
    return this.fileService.findByIdForSystemAdministration(id);
  }

  uploadImage(
    file: UploadedMultipartFile | undefined,
    uploadedByUserId: number,
  ): Promise<FileResponse> {
    return this.fileService.uploadGlobal(file, uploadedByUserId);
  }

  async create(request: SaveSystemAdminClientRequest): Promise<Client> {
    if (request.client.id !== null) {
      throw this.clientNotFound();
    }

    return this.save(null, request);
  }

  async update(id: number, request: SaveSystemAdminClientRequest): Promise<Client> {
    if (request.client.id !== id) {
      throw this.clientNotFound();
    }

    return this.save(id, request);
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

  private async save(
    clientId: number | null,
    request: SaveSystemAdminClientRequest,
  ): Promise<Client> {
    const existing = clientId === null ? null : await this.repository.findAggregate(clientId);

    if (clientId !== null && !existing) {
      throw this.clientNotFound();
    }

    const languageIds = [
      ...new Set(request.client.languageLinks.map(({ languageId }) => languageId)),
    ];

    if (languageIds.length !== request.client.languageLinks.length || languageIds.length === 0) {
      throw new BadRequestException(this.i18n.t('errors.clients.language_required'));
    }

    const languages = await this.repository.findLanguagesByIds(languageIds);

    if (languages.length !== languageIds.length) {
      throw new BadRequestException(this.i18n.t('errors.system_admin.language_not_found'));
    }

    this.assertClientLanguageLinks(request, existing);

    const languageById = new Map(languages.map((language) => [language.id, language]));
    const languageByCode = new Map(languages.map((language) => [language.languageCode, language]));
    const existingConfigurationById = new Map(
      (existing?.storageConfigurations ?? []).map((configuration) => [
        configuration.id,
        configuration,
      ]),
    );

    this.assertProfileTranslations(request, languageByCode);
    this.assertStorageRequest(request, existing);

    await Promise.all(
      request.storage.configurations.map((configuration) =>
        this.clientStorageService.validateConfiguration(
          configuration,
          configuration.id === null
            ? null
            : (existingConfigurationById.get(configuration.id)?.credential ?? null),
        ),
      ),
    );

    try {
      const saved = await this.dataSource.transaction(async (manager) => {
        const client = await this.saveClient(manager, existing, request, languageById);
        const profile = this.getAdminProfile(existing);

        await this.repository.saveProfile(
          {
            ...(profile === null ? {} : { id: profile.id }),
            client,
            isActive: true,
            isAdmin: true,
            translations: request.adminProfile.translations.map((translation) => ({
              ...(profile?.translations.find(
                (item) => item.language.languageCode === translation.locale,
              ) ?? {}),
              ...translation,
              language: languageByCode.get(translation.locale)!,
            })),
          },
          manager,
        );

        const configurationByKey = await this.saveConfigurations(
          client.id,
          request,
          existingConfigurationById,
          manager,
        );

        await this.saveRules(client.id, request, existing, configurationByKey, manager);

        return client;
      });

      await this.sessionSynchronizationService.synchronizeAll();

      return saved;
    } catch (error) {
      if (isPostgreSqlForeignKeyViolation(error)) {
        throw new ConflictException(this.i18n.t('errors.storage.configuration_in_use'));
      }

      throw error;
    }
  }

  private async saveClient(
    manager: EntityManager,
    existing: Client | null,
    request: SaveSystemAdminClientRequest,
    languageById: Map<number, Awaited<ReturnType<ClientsRepository['findLanguagesByIds']>>[number]>,
  ): Promise<Client> {
    const {
      cityId,
      id: _id,
      imageId,
      languageLinks: _languageLinks,
      ...clientData
    } = request.client;

    return this.repository.saveClient(
      {
        ...(existing === null ? {} : { id: existing.id }),
        ...clientData,
        slug:
          existing?.slug ??
          (await this.identityClientsService.generateUniqueSlug(
            manager,
            clientData.tradeName,
            clientData.document,
          )),
        city: cityId === null ? null : { id: cityId },
        image: imageId === null ? null : { id: imageId },
        availableLanguageLinks: request.client.languageLinks.map(({ id, languageId }) => ({
          ...(id === null ? {} : { id }),
          language: languageById.get(languageId)!,
        })),
      },
      manager,
    );
  }

  private async saveConfigurations(
    clientId: number,
    request: SaveSystemAdminClientRequest,
    existingById: Map<number, StorageProviderConfiguration>,
    manager: EntityManager,
  ): Promise<Map<string, StorageProviderConfiguration>> {
    const configurationByKey = new Map<string, StorageProviderConfiguration>();

    for (const configuration of request.storage.configurations) {
      const saved = await this.clientStorageService.saveConfigurationInTransaction(
        clientId,
        configuration,
        configuration.id === null ? null : (existingById.get(configuration.id)?.credential ?? null),
        manager,
      );

      configurationByKey.set(configuration.key, saved);
    }

    return configurationByKey;
  }

  private async saveRules(
    clientId: number,
    request: SaveSystemAdminClientRequest,
    existing: Client | null,
    configurationByKey: Map<string, StorageProviderConfiguration>,
    manager: EntityManager,
  ): Promise<void> {
    const existingRuleById = new Map(
      (existing?.storageFileTypeRules ?? []).map((rule) => [rule.id, rule]),
    );
    const deletedRules = request.storage.deletedRuleIds.map((id) => existingRuleById.get(id)!);

    await this.clientStorageService.deleteRulesInTransaction(deletedRules, manager);

    for (const rule of request.storage.rules) {
      const storageConfiguration = configurationByKey.get(rule.storageConfigurationKey);

      if (!storageConfiguration) {
        throw new BadRequestException(this.i18n.t('errors.common.record_not_found'));
      }

      await this.clientStorageService.saveRuleInTransaction(
        clientId,
        {
          fileType: rule.fileType,
          id: rule.id,
          isActive: rule.isActive,
          storageConfigurationId: storageConfiguration.id,
        },
        storageConfiguration,
        manager,
      );
    }

    const existingConfigurations = existing?.storageConfigurations ?? [];
    const deletedConfigurations = request.storage.deletedConfigurationIds.map((id) => {
      const configuration = existingConfigurations.find((item) => item.id === id);

      if (!configuration) {
        throw new BadRequestException(this.i18n.t('errors.common.record_not_found'));
      }

      return configuration;
    });

    await this.clientStorageService.deleteConfigurationsInTransaction(
      deletedConfigurations,
      manager,
    );
  }

  private assertProfileTranslations(
    request: SaveSystemAdminClientRequest,
    languagesByCode: Map<string, unknown>,
  ): void {
    const locales = request.adminProfile.translations.map((translation) => translation.locale);

    if (
      locales.length !== languagesByCode.size ||
      new Set(locales).size !== locales.length ||
      locales.some((locale) => !languagesByCode.has(locale))
    ) {
      throw new BadRequestException(this.i18n.t('errors.translations.language_not_found'));
    }
  }

  private assertClientLanguageLinks(
    request: SaveSystemAdminClientRequest,
    existing: Client | null,
  ): void {
    const existingLanguageByLinkId = new Map(
      (existing?.availableLanguageLinks ?? []).map((link) => [link.id, link.language.id]),
    );
    const existingLinkIdByLanguageId = new Map(
      (existing?.availableLanguageLinks ?? []).map((link) => [link.language.id, link.id]),
    );

    if (
      request.client.languageLinks.some(({ id, languageId }) => {
        if (id === null) {
          return existingLinkIdByLanguageId.has(languageId);
        }

        return existingLanguageByLinkId.get(id) !== languageId;
      })
    ) {
      throw new BadRequestException(this.i18n.t('errors.system_admin.language_not_found'));
    }
  }

  private assertStorageRequest(
    request: SaveSystemAdminClientRequest,
    existing: Client | null,
  ): void {
    const configurationIds = request.storage.configurations.flatMap((item) =>
      item.id === null ? [] : [item.id],
    );
    const ruleIds = request.storage.rules.flatMap((item) => (item.id === null ? [] : [item.id]));
    const configurationKeys = request.storage.configurations.map((item) => item.key);
    const existingConfigurationIds = new Set(
      existing?.storageConfigurations.map((item) => item.id),
    );
    const existingRuleIds = new Set(existing?.storageFileTypeRules.map((item) => item.id));

    if (
      new Set(configurationIds).size !== configurationIds.length ||
      new Set(ruleIds).size !== ruleIds.length ||
      new Set(configurationKeys).size !== configurationKeys.length ||
      new Set(request.storage.deletedConfigurationIds).size !==
        request.storage.deletedConfigurationIds.length ||
      new Set(request.storage.deletedRuleIds).size !== request.storage.deletedRuleIds.length ||
      request.storage.deletedConfigurationIds.some((id) => !existingConfigurationIds.has(id)) ||
      request.storage.deletedRuleIds.some((id) => !existingRuleIds.has(id)) ||
      configurationIds.some((id) => !existingConfigurationIds.has(id)) ||
      ruleIds.some((id) => !existingRuleIds.has(id)) ||
      request.storage.deletedConfigurationIds.some((id) => configurationIds.includes(id)) ||
      request.storage.deletedRuleIds.some((id) => ruleIds.includes(id))
    ) {
      throw new BadRequestException(this.i18n.t('errors.common.record_not_found'));
    }
  }

  private getAdminProfile(existing: Client | null) {
    if (existing === null) {
      return null;
    }

    const adminProfiles = existing.profiles.filter(
      (profile) => profile.isAdmin && profile.isActive,
    );

    if (adminProfiles.length !== 1) {
      throw new BadRequestException(this.i18n.t('errors.access_models.admin_profile_invalid'));
    }

    return adminProfiles[0];
  }

  private toAggregateResponse(client: Client): GetSystemAdminClientResponse {
    const profile = this.getAdminProfile(client)!;
    const configurationKeyById = new Map(
      client.storageConfigurations.map((configuration) => [
        configuration.id,
        `configuration:${configuration.id}`,
      ]),
    );

    return {
      id: client.id,
      address: client.address,
      addressNumber: client.addressNumber,
      cityId: client.city?.id ?? null,
      corporateName: client.corporateName,
      document: client.document,
      documentType: client.documentType,
      email: client.email,
      imageId: client.image?.id ?? null,
      isActive: client.isActive,
      languageLinks: client.availableLanguageLinks.map((link) => ({
        id: link.id,
        languageId: link.language.id,
      })),
      neighborhood: client.neighborhood,
      primaryPhone: client.primaryPhone,
      secondaryPhone: client.secondaryPhone,
      slug: client.slug,
      tradeName: client.tradeName,
      zipCode: client.zipCode,
      adminProfile: {
        translations: profile.translations.map((translation) => ({
          description: translation.description,
          locale: translation.language.languageCode,
          name: translation.name,
        })),
      },
      storage: {
        configurations: client.storageConfigurations.map((configuration) => ({
          accountId: configuration.accountId,
          bucketName: configuration.bucketName,
          endpoint: configuration.endpoint,
          hasCredential: configuration.credential !== null,
          id: configuration.id,
          identifier: configuration.identifier,
          isActive: configuration.isActive,
          key: configurationKeyById.get(configuration.id)!,
          name: configuration.name,
          projectId: configuration.projectId,
          provider: configuration.provider,
          publicBaseUrl: configuration.publicBaseUrl,
          signedUrlExpiresInSeconds: configuration.signedUrlExpiresInSeconds,
          useSignedUrls: configuration.useSignedUrls,
        })),
        rules: client.storageFileTypeRules.map((rule) => ({
          fileType: rule.fileType,
          id: rule.id,
          isActive: rule.isActive,
          storageConfigurationKey: configurationKeyById.get(rule.storageConfiguration.id)!,
        })),
      },
    };
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
}
