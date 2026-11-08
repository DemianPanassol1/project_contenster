import type { DocumentType } from '../../../domain/documents/document-type.enum.js';
import type {
  ClientLanguageResponse,
  SaveClientRequest,
} from '../../identity/clients/client.contract.js';
import type {
  SaveStorageConfigurationRequest,
  SaveStorageFileTypeRuleRequest,
  StorageConfigurationDetail,
  StorageFileTypeRuleListItem,
} from '../../media/client-storage/client-storage.contract.js';

export interface SystemAdminTranslationRequest {
  description: string | null;
  locale: string;
  name: string;
}

export interface SystemAdminClientStorageConfigurationRequest extends SaveStorageConfigurationRequest {
  key: string;
}

export interface SystemAdminClientStorageRuleRequest extends Omit<
  SaveStorageFileTypeRuleRequest,
  'storageConfigurationId'
> {
  storageConfigurationKey: string;
}

export interface SaveSystemAdminClientRequest {
  adminProfile: { translations: SystemAdminTranslationRequest[] };
  client: SaveClientRequest;
  storage: {
    configurations: SystemAdminClientStorageConfigurationRequest[];
    deletedConfigurationIds: number[];
    deletedRuleIds: number[];
    rules: SystemAdminClientStorageRuleRequest[];
  };
}

export interface SystemAdminClientStorageConfigurationDetail extends StorageConfigurationDetail {
  key: string;
}

export interface GetSystemAdminClientResponse extends Omit<SaveClientRequest, 'languageLinks'> {
  adminProfile: { translations: SystemAdminTranslationRequest[] };
  languageLinks: ClientLanguageResponse[];
  storage: {
    configurations: SystemAdminClientStorageConfigurationDetail[];
    rules: Array<
      Omit<StorageFileTypeRuleListItem, 'storageConfigurationId' | 'storageConfigurationName'> & {
        storageConfigurationKey: string;
      }
    >;
  };
}

export interface SystemAdminClientListItem {
  corporateName: string;
  document: string;
  documentType: DocumentType;
  id: number;
  imageUrl: string | null;
  isActive: boolean;
  tradeName: string;
  userCount: number;
}

export interface SetSystemAdminClientActiveRequest {
  isActive: boolean;
}
