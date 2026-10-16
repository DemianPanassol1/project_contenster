import type { FileType, StorageProvider } from '@contenster/shared';

import type { StorageProviderConfiguration } from '@/modules/media/files/entities/storage-provider-configuration.entity';

export interface StorageUploadInput {
  buffer: Buffer;
  fileType: FileType;
  mimeType: string;
  originalName: string;
  sizeInBytes: number;
  storageConfiguration: StorageProviderConfiguration;
  storedName: string;
}

export interface StorageUploadResult {
  filePath: string;
  publicUrl: string | null;
  storageKey: string;
  storageProvider: StorageProvider;
}

export interface StorageDeleteInput {
  filePath?: string | null;
  storageConfiguration?: StorageProviderConfiguration | null;
  storageKey?: string | null;
  storageProvider: StorageProvider;
}

export interface StorageCredentialOverride {
  accessKeyId?: string | null;
  clientEmail?: string | null;
  privateKey?: string | null;
  secretAccessKey?: string | null;
}

export interface StorageTestConnectionInput {
  credentials?: StorageCredentialOverride | null;
  storageConfiguration: StorageProviderConfiguration;
}
