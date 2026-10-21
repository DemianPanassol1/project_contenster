import type { FileType } from '../../../domain/media/file-type.enum.js';
import type { StorageProvider } from '../../../domain/media/storage-provider.enum.js';

export interface StorageConfigurationCredentialRequest {
  accessKeyId: string | null;
  clientEmail: string | null;
  privateKey: string | null;
  secretAccessKey: string | null;
}

export interface SaveStorageConfigurationRequest extends StorageConfigurationCredentialRequest {
  accountId: string | null;
  bucketName: string | null;
  endpoint: string | null;
  id: number | null;
  identifier: string | null;
  isActive: boolean;
  name: string;
  projectId: string | null;
  provider: StorageProvider;
  publicBaseUrl: string | null;
  signedUrlExpiresInSeconds: number | null;
  useSignedUrls: boolean;
}

export interface StorageConfigurationListItem {
  hasCredential: boolean;
  id: number;
  identifier: string | null;
  isActive: boolean;
  name: string;
  provider: StorageProvider;
}

export interface StorageConfigurationDetail extends StorageConfigurationListItem {
  accountId: string | null;
  bucketName: string | null;
  endpoint: string | null;
  projectId: string | null;
  publicBaseUrl: string | null;
  signedUrlExpiresInSeconds: number | null;
  useSignedUrls: boolean;
}

export interface TestStorageConnectionResponse {
  isAvailable: boolean;
}

export interface SaveStorageFileTypeRuleRequest {
  fileType: FileType;
  id: number | null;
  isActive: boolean;
  storageConfigurationId: number;
}

export interface StorageFileTypeRuleListItem {
  fileType: FileType;
  id: number;
  isActive: boolean;
  storageConfigurationId: number;
  storageConfigurationName: string;
}

export interface ClientStorageFileListItem {
  createdAt: string;
  fileType: FileType;
  id: number;
  mimeType: string;
  originalName: string;
  provider: StorageProvider;
  sizeInBytes: number;
  uploadedByName: string | null;
  url: string | null;
}
