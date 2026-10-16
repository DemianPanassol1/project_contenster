import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { FileType, StorageProvider } from '@contenster/shared';
import type { I18nTranslations } from '@/i18n/translations';
import type { StorageProviderConfiguration } from '@/modules/media/files/entities/storage-provider-configuration.entity';

import type {
  StorageDeleteInput,
  StorageUploadInput,
  StorageUploadResult,
} from './types/storage.types';
import {
  buildPublicUploadPath,
  buildStorageObjectKey,
  normalizeStorageKey,
  resolveLocalStoragePath,
  validateStorageIdentifier,
} from './utils/storage-path.util';

@Injectable()
export class LocalStorageService {
  constructor(private readonly i18n: I18nService<I18nTranslations>) {}

  async save(input: StorageUploadInput): Promise<StorageUploadResult> {
    const identifier = this.getIdentifier(input.storageConfiguration.identifier);
    const storageKey = buildStorageObjectKey(identifier, input.fileType, input.storedName);
    const localPath = resolveLocalStoragePath(storageKey);

    await mkdir(dirname(localPath), { recursive: true });
    await writeFile(localPath, input.buffer);

    return {
      filePath: buildPublicUploadPath(storageKey),
      publicUrl: buildPublicUploadPath(storageKey),
      storageKey,
      storageProvider: StorageProvider.local,
    };
  }

  async delete(input: StorageDeleteInput): Promise<void> {
    const storageKey = input.storageKey ?? input.filePath;

    if (!storageKey) return;

    await rm(resolveLocalStoragePath(normalizeStorageKey(storageKey)), { force: true });
  }

  async testConnection(configuration: StorageProviderConfiguration): Promise<void> {
    const storageKey = buildStorageObjectKey(
      this.getIdentifier(configuration.identifier),
      FileType.file,
      '.storage-test',
    );

    await mkdir(dirname(resolveLocalStoragePath(storageKey)), { recursive: true });
  }

  private getIdentifier(identifier: string | null): string | null {
    if (!identifier) return null;

    try {
      return validateStorageIdentifier(identifier);
    } catch {
      throw new BadRequestException(this.i18n.t('errors.storage.invalid_identifier'));
    }
  }
}
