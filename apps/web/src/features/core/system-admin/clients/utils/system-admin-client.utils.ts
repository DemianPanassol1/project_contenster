import {
  DocumentType,
  FileType,
  type GetSystemAdminClientResponse,
  type SaveSystemAdminClientRequest,
  StorageProvider,
} from '@contenster/shared';
import { generateID } from '@/utils';

import type {
  SystemAdminClientFormValues,
  SystemAdminStorageConfigurationFormValues,
  SystemAdminStorageRuleFormValues,
} from '../types/system-admin-client-form.types';

const createConfigurationKey = (): string => `configuration:${generateID()}`;

export const getSystemAdminStorageConfigurationDefaultValues =
  (): SystemAdminStorageConfigurationFormValues => ({
    accessKeyId: null,
    accountId: null,
    bucketName: null,
    clientEmail: null,
    endpoint: null,
    hasCredential: false,
    id: null,
    identifier: '',
    isActive: true,
    key: createConfigurationKey(),
    name: '',
    privateKey: null,
    projectId: null,
    provider: StorageProvider.local,
    publicBaseUrl: null,
    secretAccessKey: null,
    signedUrlExpiresInSeconds: null,
    useSignedUrls: false,
  });

export const getSystemAdminStorageRuleDefaultValues = (): SystemAdminStorageRuleFormValues => ({
  fileType: FileType.file,
  id: null,
  isActive: true,
  rowId: `rule:${generateID()}`,
  storageConfigurationKey: '',
});

export const getSystemAdminClientDefaultValues = (): SystemAdminClientFormValues => ({
  address: '',
  addressNumber: '',
  adminProfileIsActive: true,
  adminProfileTranslations: [],
  cityId: null,
  corporateName: '',
  document: '',
  documentType: DocumentType.cnpj,
  email: '',
  id: null,
  imageId: null,
  initialStorageConfigurationIds: [],
  initialStorageRuleIds: [],
  isActive: true,
  languageIds: [],
  languageLinks: [],
  neighborhood: '',
  primaryPhone: '',
  secondaryPhone: null,
  slug: '',
  storageConfigurations: [],
  storageRules: [],
  tradeName: '',
  zipCode: '',
});

export const mapSystemAdminClientContent = (
  content: GetSystemAdminClientResponse,
): SystemAdminClientFormValues => ({
  ...content,
  adminProfileIsActive: true,
  adminProfileTranslations: content.adminProfile.translations,
  initialStorageConfigurationIds: content.storage.configurations.map(
    (configuration) => configuration.id,
  ),
  initialStorageRuleIds: content.storage.rules.map((rule) => rule.id),
  languageIds: content.languageLinks.map((link) => link.languageId),
  languageLinks: content.languageLinks,
  storageConfigurations: content.storage.configurations.map((configuration) => ({
    ...configuration,
    accessKeyId: null,
    clientEmail: null,
    privateKey: null,
    secretAccessKey: null,
  })),
  storageRules: content.storage.rules.map((rule) => ({
    ...rule,
    rowId: `rule:${rule.id}`,
  })),
});

export const mapSystemAdminClientPayload = (
  values: SystemAdminClientFormValues,
): SaveSystemAdminClientRequest => {
  const linkIdByLanguageId = new Map(
    values.languageLinks.map((link) => [link.languageId, link.id]),
  );
  const configurationIds = new Set(
    values.storageConfigurations.flatMap((configuration) =>
      configuration.id === null ? [] : [configuration.id],
    ),
  );
  const ruleIds = new Set(
    values.storageRules.flatMap((rule) => (rule.id === null ? [] : [rule.id])),
  );
  const {
    adminProfileTranslations,
    adminProfileIsActive: _adminProfileIsActive,
    initialStorageConfigurationIds,
    initialStorageRuleIds,
    languageIds,
    languageLinks: _languageLinks,
    slug: _slug,
    storageConfigurations,
    storageRules,
    ...client
  } = values;

  return {
    adminProfile: { translations: adminProfileTranslations },
    client: {
      ...client,
      languageLinks: languageIds.map((languageId) => ({
        id: linkIdByLanguageId.get(languageId) ?? null,
        languageId,
      })),
    },
    storage: {
      configurations: storageConfigurations.map(
        ({ hasCredential: _hasCredential, ...item }) => item,
      ),
      deletedConfigurationIds: initialStorageConfigurationIds.filter(
        (id) => !configurationIds.has(id),
      ),
      deletedRuleIds: initialStorageRuleIds.filter((id) => !ruleIds.has(id)),
      rules: storageRules.map(({ rowId: _rowId, ...item }) => item),
    },
  };
};
