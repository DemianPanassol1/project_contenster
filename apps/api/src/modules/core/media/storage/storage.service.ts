import { BadRequestException, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { StorageProvider } from '@contenster/shared';
import type { I18nTranslations } from '@/i18n/translations';

import type {
  StorageDeleteInput,
  StorageTestConnectionInput,
  StorageUploadInput,
  StorageUploadResult,
} from './types/storage.types';
import { CloudflareR2StorageService } from './cloudflare-r2-storage.service';
import { GoogleCloudStorageService } from './google-cloud-storage.service';
import { LocalStorageService } from './local-storage.service';

@Injectable()
export class StorageService {
  constructor(
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly localStorageService: LocalStorageService,
    private readonly cloudflareR2StorageService: CloudflareR2StorageService,
    private readonly googleCloudStorageService: GoogleCloudStorageService,
  ) {}

  async upload(input: StorageUploadInput): Promise<StorageUploadResult> {
    switch (input.storageConfiguration.provider) {
      case StorageProvider.local:
        return this.localStorageService.save(input);
      case StorageProvider.cloudflareR2:
        return this.cloudflareR2StorageService.save(input);
      case StorageProvider.googleCloudStorage:
        return this.googleCloudStorageService.save(input);
      default:
        throw new BadRequestException(this.i18n.t('errors.storage.provider_not_implemented'));
    }
  }

  uploadDefaultLocal(
    input: Omit<StorageUploadInput, 'storageConfiguration'>,
  ): Promise<StorageUploadResult> {
    return this.localStorageService.saveDefault(input);
  }

  async delete(input: StorageDeleteInput): Promise<void> {
    switch (input.storageProvider) {
      case StorageProvider.local:
        return this.localStorageService.delete(input);
      case StorageProvider.cloudflareR2:
        return this.cloudflareR2StorageService.delete(input);
      case StorageProvider.googleCloudStorage:
        return this.googleCloudStorageService.delete(input);
      default:
        throw new BadRequestException(this.i18n.t('errors.storage.provider_not_implemented'));
    }
  }

  async testConnection(input: StorageTestConnectionInput): Promise<void> {
    switch (input.storageConfiguration.provider) {
      case StorageProvider.local:
        return this.localStorageService.testConnection(input.storageConfiguration);
      case StorageProvider.cloudflareR2:
        return this.cloudflareR2StorageService.testConnection(input);
      case StorageProvider.googleCloudStorage:
        return this.googleCloudStorageService.testConnection(input);
      default:
        throw new BadRequestException(this.i18n.t('errors.storage.provider_not_implemented'));
    }
  }
}
