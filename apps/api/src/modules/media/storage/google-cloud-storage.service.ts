import { Storage } from '@google-cloud/storage';
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
  isValidGoogleCloudStorageBucketName,
  isValidGoogleCloudStorageProjectId,
  isValidStorageObjectKey,
  isValidStoragePublicBaseUrl,
  validateStorageIdentifier,
} from './utils/storage-path.util';

interface GoogleCredentials {
  clientEmail: string;
  privateKey: string;
}

@Injectable()
export class GoogleCloudStorageService {
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
      )
        .bucket(this.getBucketName(configuration))
        .file(storageKey)
        .save(input.buffer, { contentType: input.mimeType, resumable: false });
    } catch {
      throw new InternalServerErrorException(this.i18n.t('errors.media.file_upload_failed'));
    }

    const publicUrl = buildStoragePublicUrl(configuration.publicBaseUrl, storageKey);

    return {
      filePath: publicUrl ?? storageKey,
      publicUrl,
      storageKey,
      storageProvider: StorageProvider.googleCloudStorage,
    };
  }

  async delete(input: StorageDeleteInput): Promise<void> {
    if (!input.storageConfiguration || !input.storageKey) return;

    await (
      await this.createClient(input.storageConfiguration)
    )
      .bucket(this.getBucketName(input.storageConfiguration))
      .file(input.storageKey)
      .delete({ ignoreNotFound: true });
  }

  async testConnection(input: StorageTestConnectionInput): Promise<void> {
    try {
      const [exists] = await (
        await this.createClient(input.storageConfiguration, input.credentials)
      )
        .bucket(this.getBucketName(input.storageConfiguration))
        .exists();
      if (!exists) throw new Error('Bucket not found.');
    } catch {
      throw new BadRequestException(this.i18n.t('errors.storage.connection_test_failed'));
    }
  }

  private async createClient(
    configuration: StorageProviderConfiguration,
    override?: StorageCredentialOverride | null,
  ): Promise<Storage> {
    const credentials = await this.getCredentials(configuration.id, override);

    return new Storage({
      credentials: { client_email: credentials.clientEmail, private_key: credentials.privateKey },
      projectId: this.getProjectId(configuration),
    });
  }

  private async getCredentials(
    configurationId: number,
    override?: StorageCredentialOverride | null,
  ): Promise<GoogleCredentials> {
    if (override?.clientEmail && override.privateKey) {
      return {
        clientEmail: override.clientEmail,
        privateKey: this.normalizePrivateKey(override.privateKey),
      };
    }

    const credential = await this.credentials.findOne({
      where: { storageConfiguration: { id: configurationId } },
    });

    if (!credential?.clientEmailEncrypted || !credential.privateKeyEncrypted) {
      throw new BadRequestException(this.i18n.t('errors.storage.credentials_required'));
    }

    try {
      return {
        clientEmail: decryptStorageCredential(credential.clientEmailEncrypted),
        privateKey: this.normalizePrivateKey(
          decryptStorageCredential(credential.privateKeyEncrypted),
        ),
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
    if (!bucketName || !isValidGoogleCloudStorageBucketName(bucketName)) {
      throw new BadRequestException(this.i18n.t('errors.storage.invalid_configuration'));
    }

    return bucketName;
  }

  private getProjectId(configuration: StorageProviderConfiguration): string {
    const projectId = configuration.projectId?.trim();
    if (!projectId || !isValidGoogleCloudStorageProjectId(projectId)) {
      throw new BadRequestException(this.i18n.t('errors.storage.invalid_configuration'));
    }

    return projectId;
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

  private normalizePrivateKey(value: string): string {
    return value.replace(/\\n/g, '\n');
  }
}
