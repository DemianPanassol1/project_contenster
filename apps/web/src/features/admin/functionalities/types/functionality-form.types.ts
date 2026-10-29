import type { FunctionalityLanguageInput, SaveFunctionalityRequest } from '@contenster/shared';

export interface FunctionalityFormValues extends Omit<SaveFunctionalityRequest, 'languageLinks'> {
  languageIds: number[];
  languageLinks: FunctionalityLanguageInput[];
}
