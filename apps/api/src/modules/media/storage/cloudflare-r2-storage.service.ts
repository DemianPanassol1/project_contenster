import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { StorageProvider } from '@contenster/shared';
import type { I18nTranslations } from '@/i18n/translations';
import { decryptStorageCredential } from '@/infrastructure/security/storage-credential-crypto.util';
import type { StorageProviderConfiguration } from '@/modules/media/files/entities/storage-provider-configuration.entity';
import { StorageProviderCredential } from '@/modules/media/files/entities/storage-provider-credential.entity';

import type {
  StorageCredentialOverride,
  StorageDeleteInput,
  StorageTestConnectionInput,
  StorageUploadInput,
  StorageUploadResult,
} from './types/storage.types';
import {
  buildStorageObjectKey,
  buildStoragePublicUrl,
  isValidCloudflareR2AccountId,
  isValidCloudflareR2BucketName,
  isValidStorageObjectKey,
  isValidStoragePublicBaseUrl,
  normalizeCloudflareR2Endpoint,
  validateStorageIdentifier,
} from './utils/storage-path.util';

interface R2Credentials {
  accessKeyId: string;
  secretAccessKey: string;
}

@Injectable()
export class CloudflareR2StorageService {
  constructor(
    @InjectRepository(StorageProviderCredential)
    private readonly credentials: Repository<StorageProviderCredential>,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async save(input: StorageUploadInput): Promise<StorageUploadResult> {
    const configuration = input.storageConfiguration;
    const storageKey = this.buildStorageKey(input);
    this.assertPublicAccess(configuration);

    try {
      await (
        await this.createClient(configuration)
      ).send(
        new PutObjectCommand({
          Body: input.buffer,
          Bucket: this.getBucketName(configuration),
          ContentLength: input.sizeInBytes,
          ContentType: input.mimeType,
          Key: storageKey,
        }),
      );
    } catch {
      throw new InternalServerErrorException(this.i18n.t('errors.media.file_upload_failed'));
    }

    const publicUrl = buildStoragePublicUrl(configuration.publicBaseUrl, storageKey);

    return {
      filePath: publicUrl ?? storageKey,
      publicUrl,
      storageKey,
      storageProvider: StorageProvider.cloudflareR2,
    };
  }

  async delete(input: StorageDeleteInput): Promise<void> {
    if (!input.storageConfiguration || !input.storageKey) return;

    await (
      await this.createClient(input.storageConfiguration)
    ).send(
      new DeleteObjectCommand({
        Bucket: this.getBucketName(input.storageConfiguration),
        Key: input.storageKey,
      }),
    );
  }

  async testConnection(input: StorageTestConnectionInput): Promise<void> {
    this.assertPublicAccess(input.storageConfiguration);

    try {
      await (
        await this.createClient(input.storageConfiguration, input.credentials)
      ).send(
        new ListObjectsV2Command({
          Bucket: this.getBucketName(input.storageConfiguration),
          MaxKeys: 1,
        }),
      );
    } catch {
      throw new BadRequestException(this.i18n.t('errors.storage.connection_test_failed'));
    }
  }

  private async createClient(
    configuration: StorageProviderConfiguration,
    override?: StorageCredentialOverride | null,
  ): Promise<S3Client> {
    return new S3Client({
      credentials: await this.getCredentials(configuration.id, override),
      endpoint: this.getEndpoint(configuration),
      forcePathStyle: true,
      region: 'auto',
    });
  }

  private async getCredentials(
    configurationId: number,
    override?: StorageCredentialOverride | null,
  ): Promise<R2Credentials> {
    if (override?.accessKeyId && override.secretAccessKey) {
      return { accessKeyId: override.accessKeyId, secretAccessKey: override.secretAccessKey };
    }

    const credential = await this.credentials.findOne({
      where: { storageConfiguration: { id: configurationId } },
    });

    if (!credential?.accessKeyIdEncrypted || !credential.secretAccessKeyEncrypted) {
      throw new BadRequestException(this.i18n.t('errors.storage.credentials_required'));
    }

    try {
      return {
        accessKeyId: decryptStorageCredential(credential.accessKeyIdEncrypted),
        secretAccessKey: decryptStorageCredential(credential.secretAccessKeyEncrypted),
      };
    } catch {
      throw new BadRequestException(this.i18n.t('errors.storage.credentials_required'));
    }
  }

  private buildStorageKey(input: StorageUploadInput): string {
    const identifier = input.storageConfiguration.identifier?.trim();

    if (!identifier)
      throw new BadRequestException(this.i18n.t('errors.storage.invalid_identifier'));

    try {
      const storageKey = buildStorageObjectKey(
        validateStorageIdentifier(identifier),
        input.fileType,
        input.storedName,
      );

      if (!isValidStorageObjectKey(storageKey)) throw new Error();

      return storageKey;
    } catch {
      throw new BadRequestException(this.i18n.t('errors.storage.invalid_path'));
    }
  }

  private getBucketName(configuration: StorageProviderConfiguration): string {
    const bucketName = configuration.bucketName?.trim();

    if (!bucketName || !isValidCloudflareR2BucketName(bucketName)) {
      throw new BadRequestException(this.i18n.t('errors.storage.invalid_configuration'));
    }

    return bucketName;
  }

  private getEndpoint(configuration: StorageProviderConfiguration): string {
    const endpoint = configuration.endpoint?.trim();

    if (endpoint) {
      const normalized = normalizeCloudflareR2Endpoint(endpoint);
      if (normalized) return normalized;
    }

    const accountId = configuration.accountId?.trim();
    if (!accountId || !isValidCloudflareR2AccountId(accountId)) {
      throw new BadRequestException(this.i18n.t('errors.storage.invalid_configuration'));
    }

    return `https://${accountId}.r2.cloudflarestorage.com`;
  }

  private assertPublicAccess(configuration: StorageProviderConfiguration): void {
    const publicBaseUrl = configuration.publicBaseUrl?.trim();

    if (
      configuration.useSignedUrls ||
      !publicBaseUrl ||
      !isValidStoragePublicBaseUrl(publicBaseUrl)
    ) {
      throw new BadRequestException(this.i18n.t('errors.storage.invalid_configuration'));
    }
  }
}
