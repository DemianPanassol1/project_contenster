import type { ClientLanguageResponse, SaveClientRequest } from '@contenster/shared';

export interface ClientFormValues extends Omit<SaveClientRequest, 'languageLinks'> {
  languageIds: number[];
  languageLinks: ClientLanguageResponse[];
}
