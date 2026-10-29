import type {
  SaveStorageConfigurationRequest,
  SaveStorageFileTypeRuleRequest,
} from '@contenster/shared';

export interface StorageConfigurationFormValues extends SaveStorageConfigurationRequest {
  hasCredential: boolean;
}

export type StorageFileTypeRuleFormValues = SaveStorageFileTypeRuleRequest;
