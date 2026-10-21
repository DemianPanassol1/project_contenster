import type { PaginatedBody } from '@contenster/shared';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { I18nService } from 'nestjs-i18n';
import type { DeepPartial } from 'typeorm';

import type { I18nTranslations } from '@/i18n/translations';
import {
  decryptStorageCredential,
  encryptStorageCredential,
} from '@/infrastructure/security/storage-credential-crypto.util';
import { StorageProviderCredential } from '@/modules/media/files/entities/storage-provider-credential.entity';
import { StorageService } from '@/modules/media/storage/storage.service';
import { isPostgreSqlForeignKeyViolation } from '@/shared/database/postgres-error.helper';
import {
  type DeleteRecordsRequestDto,
  DeleteRecordsResponseDto,
  normalizeDeleteRecordIds,
  type PaginateRequestDto,
} from '@/shared/dtos';
import { buildPaginationMeta } from '@/shared/pagination';
import { toResponseDto } from '@/shared/responses';

import { StorageProviderConfiguration } from '../files/entities/storage-provider-configuration.entity';

import { SaveStorageConfigurationRequestDto } from './dto/req/save-storage-configuration.request.dto';
import { SaveStorageFileTypeRuleRequestDto } from './dto/req/save-storage-file-type-rule.request.dto';
import { ClientStorageFileListItemResponseDto } from './dto/res/client-storage-file-list-item.response.dto';
import { StorageConfigurationDetailResponseDto } from './dto/res/storage-configuration-detail.response.dto';
import { StorageConfigurationListItemResponseDto } from './dto/res/storage-configuration-list-item.response.dto';
import { StorageFileTypeRuleListItemResponseDto } from './dto/res/storage-file-type-rule-list-item.response.dto';
import { TestStorageConnectionResponseDto } from './dto/res/test-storage-connection.response.dto';
import { ClientStorageRepository } from './client-storage.repository';

@Injectable()
export class ClientStorageService {
  constructor(
    private readonly repository: ClientStorageRepository,
    private readonly storageService: StorageService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async listConfigurations(
    clientId: number,
    request: PaginateRequestDto,
  ): Promise<PaginatedBody<StorageConfigurationListItemResponseDto>> {
    const [configurations, total] = await this.repository.listConfigurations(clientId, request);

    return {
      items: toResponseDto(
        StorageConfigurationListItemResponseDto,
        configurations.map((item) => ({
          hasCredential: item.credential !== null,
          id: item.id,
          identifier: item.identifier,
          isActive: item.isActive,
          name: item.name,
          provider: item.provider,
        })),
      ),
      meta: buildPaginationMeta(request, total),
    };
  }

  async listRules(
    clientId: number,
    request: PaginateRequestDto,
  ): Promise<PaginatedBody<StorageFileTypeRuleListItemResponseDto>> {
    const [rules, total] = await this.repository.listRules(clientId, request);

    return {
      items: toResponseDto(
        StorageFileTypeRuleListItemResponseDto,
        rules.map((item) => ({
          fileType: item.fileType,
          id: item.id,
          isActive: item.isActive,
          storageConfigurationId: item.storageConfiguration.id,
          storageConfigurationName: item.storageConfiguration.name,
        })),
      ),
      meta: buildPaginationMeta(request, total),
    };
  }

  async listFiles(
    clientId: number,
    request: PaginateRequestDto,
  ): Promise<PaginatedBody<ClientStorageFileListItemResponseDto>> {
    const [files, total] = await this.repository.listFiles(clientId, request);

    return {
      items: toResponseDto(
        ClientStorageFileListItemResponseDto,
        files.map((item) => ({
          createdAt: item.createdAt.toISOString(),
          fileType: item.fileType,
          id: item.id,
          mimeType: item.mimeType,
          originalName: item.originalName,
          provider: item.storageProvider,
          sizeInBytes: item.sizeInBytes,
          uploadedByName: item.uploadedBy?.name ?? null,
          url: item.publicUrl,
        })),
      ),
      meta: buildPaginationMeta(request, total),
    };
  }

  async saveConfiguration(
    clientId: number,
    request: SaveStorageConfigurationRequestDto,
  ): Promise<StorageConfigurationListItemResponseDto> {
    const existing =
      request.id === null ? null : await this.repository.findConfiguration(clientId, request.id);

    if (request.id !== null && !existing) {
      throw new NotFoundException(this.i18n.t('errors.common.record_not_found'));
    }

    const configuration = Object.assign(existing ?? new StorageProviderConfiguration(), {
      accountId: request.accountId,
      bucketName: request.bucketName,
      client: { id: clientId },
      endpoint: request.endpoint,
      identifier: request.identifier,
      isActive: request.isActive,
      name: request.name,
      projectId: request.projectId,
      provider: request.provider,
      publicBaseUrl: request.publicBaseUrl,
      signedUrlExpiresInSeconds: request.signedUrlExpiresInSeconds,
      useSignedUrls: request.useSignedUrls,
    });

    const credentials = this.toCredentialOverride(request, existing?.credential ?? null);

    await this.storageService.testConnection({
      credentials,
      storageConfiguration: configuration,
    });

    const saved = await this.repository.saveConfiguration(
      configuration,
      this.toEncryptedCredential(request, existing?.credential ?? null),
    );

    return toResponseDto(StorageConfigurationListItemResponseDto, {
      hasCredential:
        this.hasCredentialInput(request) || (existing !== null && existing.credential !== null),
      id: saved.id,
      identifier: saved.identifier,
      isActive: saved.isActive,
      name: saved.name,
      provider: saved.provider,
    });
  }

  async saveRule(
    clientId: number,
    request: SaveStorageFileTypeRuleRequestDto,
  ): Promise<StorageFileTypeRuleListItemResponseDto> {
    const existing =
      request.id === null ? null : await this.repository.findRule(clientId, request.id);

    if (request.id !== null && !existing) {
      throw new NotFoundException(this.i18n.t('errors.common.record_not_found'));
    }

    const configuration = await this.repository.findConfiguration(
      clientId,
      request.storageConfigurationId,
    );

    if (!configuration) {
      throw new BadRequestException(this.i18n.t('errors.common.record_not_found'));
    }

    if (
      request.isActive &&
      (await this.repository.hasActiveRule(clientId, request.fileType, request.id))
    ) {
      throw new BadRequestException(
        this.i18n.t('errors.storage.active_file_type_rule_already_exists'),
      );
    }

    const saved = await this.repository.saveRule({
      ...(existing ?? {}),
      client: { id: clientId },
      fileType: request.fileType,
      isActive: request.isActive,
      storageConfiguration: configuration,
    });

    return toResponseDto(StorageFileTypeRuleListItemResponseDto, {
      fileType: saved.fileType,
      id: saved.id,
      isActive: saved.isActive,
      storageConfigurationId: configuration.id,
      storageConfigurationName: configuration.name,
    });
  }

  async getConfiguration(
    clientId: number,
    id: number,
  ): Promise<StorageConfigurationDetailResponseDto> {
    const configuration = await this.getConfigurationByIdOrFail(clientId, id);

    return toResponseDto(StorageConfigurationDetailResponseDto, {
      accountId: configuration.accountId,
      bucketName: configuration.bucketName,
      endpoint: configuration.endpoint,
      hasCredential: configuration.credential !== null,
      id: configuration.id,
      identifier: configuration.identifier,
      isActive: configuration.isActive,
      name: configuration.name,
      projectId: configuration.projectId,
      provider: configuration.provider,
      publicBaseUrl: configuration.publicBaseUrl,
      signedUrlExpiresInSeconds: configuration.signedUrlExpiresInSeconds,
      useSignedUrls: configuration.useSignedUrls,
    });
  }

  async testConfiguration(
    clientId: number,
    request: SaveStorageConfigurationRequestDto,
  ): Promise<TestStorageConnectionResponseDto> {
    const existing =
      request.id === null ? null : await this.repository.findConfiguration(clientId, request.id);

    if (request.id !== null && !existing) {
      throw new NotFoundException(this.i18n.t('errors.common.record_not_found'));
    }

    const configuration = Object.assign(existing ?? new StorageProviderConfiguration(), {
      accountId: request.accountId,
      bucketName: request.bucketName,
      client: { id: clientId },
      endpoint: request.endpoint,
      identifier: request.identifier,
      isActive: request.isActive,
      name: request.name,
      projectId: request.projectId,
      provider: request.provider,
      publicBaseUrl: request.publicBaseUrl,
      signedUrlExpiresInSeconds: request.signedUrlExpiresInSeconds,
      useSignedUrls: request.useSignedUrls,
    });

    await this.storageService.testConnection({
      credentials: this.toCredentialOverride(request, existing?.credential ?? null),
      storageConfiguration: configuration,
    });

    return toResponseDto(TestStorageConnectionResponseDto, { isAvailable: true });
  }

  async deleteConfigurations(
    clientId: number,
    request: DeleteRecordsRequestDto,
  ): Promise<DeleteRecordsResponseDto> {
    const ids = normalizeDeleteRecordIds(request, this.i18n.t('validation.invalid_delete_request'));
    const configurations = await this.repository.findConfigurationsByIds(clientId, ids);

    if (configurations.length !== ids.length) {
      throw new NotFoundException(this.i18n.t('errors.common.record_not_found'));
    }

    try {
      const deletedIds = await this.repository.deleteConfigurations(configurations);

      return toResponseDto(DeleteRecordsResponseDto, { ids: deletedIds });
    } catch (error) {
      if (isPostgreSqlForeignKeyViolation(error)) {
        throw new ConflictException(this.i18n.t('errors.storage.configuration_in_use'));
      }

      throw error;
    }
  }

  async deleteRules(
    clientId: number,
    request: DeleteRecordsRequestDto,
  ): Promise<DeleteRecordsResponseDto> {
    const ids = normalizeDeleteRecordIds(request, this.i18n.t('validation.invalid_delete_request'));
    const rules = await this.repository.findRulesByIds(clientId, ids);

    if (rules.length !== ids.length) {
      throw new NotFoundException(this.i18n.t('errors.common.record_not_found'));
    }

    return toResponseDto(DeleteRecordsResponseDto, {
      ids: await this.repository.deleteRules(rules),
    });
  }

  private async getConfigurationByIdOrFail(
    clientId: number,
    id: number,
  ): Promise<StorageProviderConfiguration> {
    const configuration = await this.repository.findConfiguration(clientId, id);

    if (!configuration) {
      throw new NotFoundException(this.i18n.t('errors.common.record_not_found'));
    }

    return configuration;
  }

  private toCredentialOverride(
    request: SaveStorageConfigurationRequestDto,
    existingCredential: StorageProviderCredential | null,
  ) {
    if (!this.hasCredentialInput(request) && existingCredential === null) {
      return null;
    }

    return {
      accessKeyId: this.resolveCredentialValue(
        request.accessKeyId,
        existingCredential?.accessKeyIdEncrypted ?? null,
      ),
      clientEmail: this.resolveCredentialValue(
        request.clientEmail,
        existingCredential?.clientEmailEncrypted ?? null,
      ),
      privateKey: this.resolveCredentialValue(
        request.privateKey,
        existingCredential?.privateKeyEncrypted ?? null,
      ),
      secretAccessKey: this.resolveCredentialValue(
        request.secretAccessKey,
        existingCredential?.secretAccessKeyEncrypted ?? null,
      ),
    };
  }

  private toEncryptedCredential(
    request: SaveStorageConfigurationRequestDto,
    existingCredential: StorageProviderCredential | null,
  ): DeepPartial<StorageProviderCredential> | null {
    if (!this.hasCredentialInput(request)) {
      return null;
    }

    const credentials = this.toCredentialOverride(request, existingCredential);

    if (!credentials) {
      return null;
    }

    return {
      ...(existingCredential === null ? {} : { id: existingCredential.id }),
      accessKeyIdEncrypted:
        credentials.accessKeyId === null ? null : encryptStorageCredential(credentials.accessKeyId),
      clientEmailEncrypted:
        credentials.clientEmail === null ? null : encryptStorageCredential(credentials.clientEmail),
      privateKeyEncrypted:
        credentials.privateKey === null ? null : encryptStorageCredential(credentials.privateKey),
      secretAccessKeyEncrypted:
        credentials.secretAccessKey === null
          ? null
          : encryptStorageCredential(credentials.secretAccessKey),
    };
  }

  private resolveCredentialValue(
    value: string | null,
    encryptedValue: string | null,
  ): string | null {
    if (value !== null) {
      return value;
    }

    if (encryptedValue === null) {
      return null;
    }

    return decryptStorageCredential(encryptedValue);
  }

  private hasCredentialInput(request: SaveStorageConfigurationRequestDto): boolean {
    return [
      request.accessKeyId,
      request.clientEmail,
      request.privateKey,
      request.secretAccessKey,
    ].some((value) => value !== null);
  }
}
