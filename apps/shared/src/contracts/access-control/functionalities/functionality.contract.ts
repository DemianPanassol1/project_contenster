export interface FunctionalityTranslationInput {
  locale: string;
  name: string;
  description: string | null;
}

export type FunctionalityTranslationResponse = FunctionalityTranslationInput;

export interface SaveFunctionalityRequest {
  id: number | null;
  clientId: number | null;
  moduleId: number;
  parentId: number | null;
  slug: string;
  icon: string | null;
  order: number;
  isNavigationGroup: boolean;
  isActive: boolean;
  translations: FunctionalityTranslationInput[];
  languageIds: number[];
}

export interface FunctionalityListItem {
  id: number;
  moduleId: number;
  parentId: number | null;
  slug: string;
  icon: string | null;
  order: number;
  isNavigationGroup: boolean;
  isActive: boolean;
  name: string;
  description: string | null;
}

export interface GetFunctionalityByIdResponse extends FunctionalityListItem {
  clientId: number | null;
  translations: FunctionalityTranslationResponse[];
  languageIds: number[];
}
