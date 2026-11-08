import type { FileType, StorageProvider, SystemAdminTranslationRequest } from '@contenster/shared';

import type { ClientFormValues } from '@/features/core/admin/clients/types/client-form.types';

export interface SystemAdminStorageConfigurationFormValues {
  accessKeyId: string | null;
  accountId: string | null;
  bucketName: string | null;
  clientEmail: string | null;
  endpoint: string | null;
  hasCredential: boolean;
  id: number | null;
  identifier: string | null;
  isActive: boolean;
  key: string;
  name: string;
  privateKey: string | null;
  projectId: string | null;
  provider: StorageProvider;
  publicBaseUrl: string | null;
  secretAccessKey: string | null;
  signedUrlExpiresInSeconds: number | null;
  useSignedUrls: boolean;
}

export interface SystemAdminStorageRuleFormValues {
  fileType: FileType;
  id: number | null;
  isActive: boolean;
  rowId: string;
  storageConfigurationKey: string;
}

export interface SystemAdminClientFormValues extends ClientFormValues {
  adminProfileIsActive: boolean;
  adminProfileTranslations: SystemAdminTranslationRequest[];
  initialStorageConfigurationIds: number[];
  initialStorageRuleIds: number[];
  storageConfigurations: SystemAdminStorageConfigurationFormValues[];
  storageRules: SystemAdminStorageRuleFormValues[];
}
