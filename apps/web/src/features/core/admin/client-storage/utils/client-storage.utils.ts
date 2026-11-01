import {
  FileType,
  type SaveStorageConfigurationRequest,
  type StorageConfigurationDetail,
  StorageProvider,
  type StorageProvider as StorageProviderType,
} from '@contenster/shared';

import type {
  StorageConfigurationFormValues,
  StorageFileTypeRuleFormValues,
} from '../types/client-storage.types';

export const getStorageConfigurationDefaultValues = (): StorageConfigurationFormValues => ({
  accessKeyId: null,
  accountId: null,
  bucketName: null,
  clientEmail: null,
  endpoint: null,
  hasCredential: false,
  id: null,
  identifier: '',
  isActive: true,
  name: '',
  privateKey: null,
  projectId: null,
  provider: StorageProvider.local,
  publicBaseUrl: null,
  secretAccessKey: null,
  signedUrlExpiresInSeconds: null,
  useSignedUrls: false,
});

export const mapStorageConfigurationContent = (
  content: StorageConfigurationDetail,
): StorageConfigurationFormValues => ({
  ...content,
  accessKeyId: null,
  clientEmail: null,
  hasCredential: content.hasCredential,
  privateKey: null,
  secretAccessKey: null,
});

export const mapStorageConfigurationPayload = (
  values: StorageConfigurationFormValues,
): SaveStorageConfigurationRequest => {
  const { hasCredential: _hasCredential, ...request } = values;

  return request;
};

export const getStorageFileTypeRuleDefaultValues = (): StorageFileTypeRuleFormValues => ({
  fileType: FileType.file,
  id: null,
  isActive: true,
  storageConfigurationId: 0,
});

export const storageProviderOptions = [
  { label: 'Local', value: StorageProvider.local },
  { label: 'Cloudflare R2', value: StorageProvider.cloudflareR2 },
  { label: 'Google Cloud Storage', value: StorageProvider.googleCloudStorage },
] as const;

export const getStorageProviderLabel = (provider: StorageProviderType): string =>
  storageProviderOptions.find((option) => option.value === provider)?.label ?? provider;

export const getStorageFileTypeLabel = (
  fileType: FileType,
  labels: Record<FileType, string>,
): string => labels[fileType];

export const getStorageFileIconName = (fileType: FileType): 'file-text' | 'image' | 'video' => {
  if (fileType === FileType.video) {
    return 'video';
  }

  if (fileType === FileType.image || fileType === FileType.icon) {
    return 'image';
  }

  return 'file-text';
};

export const openStorageFileUrl = (url: string | null): void => {
  if (!url) {
    return;
  }

  const openedWindow = window.open(url, '_blank', 'noopener,noreferrer');

  if (openedWindow) {
    openedWindow.opener = null;
  }
};
