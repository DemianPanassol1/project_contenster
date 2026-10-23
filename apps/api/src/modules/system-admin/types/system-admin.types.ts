import type { SaveClientRequestDto } from '@/modules/identity/clients/dto/req/save-client.request.dto';

export type SystemAdminTranslation = {
  locale: string;
  name: string;
  description: string | null;
};

export type CreateSystemAdminClientRequest = {
  client: SaveClientRequestDto;
  modules: Array<{ key: string; order: number; translations: SystemAdminTranslation[] }>;
  functionalities: Array<{
    moduleKey: string;
    parentSlug: string | null;
    slug: string;
    icon: string | null;
    order: number;
    isNavigationGroup: boolean;
    translations: SystemAdminTranslation[];
    languageIds: number[];
  }>;
  adminProfile: { translations: SystemAdminTranslation[] };
};
