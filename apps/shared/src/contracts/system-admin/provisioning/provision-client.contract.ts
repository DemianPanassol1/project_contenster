import type { SaveClientRequest } from '../../identity/clients/client.contract.js';

export interface SystemAdminTranslationRequest {
  description: string | null;
  locale: string;
  name: string;
}

export interface SystemAdminModuleProvisionRequest {
  key: string;
  order: number;
  translations: SystemAdminTranslationRequest[];
}

export interface SystemAdminFunctionalityProvisionRequest {
  icon: string | null;
  isNavigationGroup: boolean;
  languageIds: number[];
  moduleKey: string;
  order: number;
  parentSlug: string | null;
  slug: string;
  translations: SystemAdminTranslationRequest[];
}

export interface CreateSystemAdminClientRequest {
  adminProfile: { translations: SystemAdminTranslationRequest[] };
  client: SaveClientRequest;
  functionalities: SystemAdminFunctionalityProvisionRequest[];
  modules: SystemAdminModuleProvisionRequest[];
}
