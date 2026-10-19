export interface FunctionalityTranslationInput {
  id: number | null;
  locale: string;
  name: string;
  description: string | null;
}

export interface FunctionalityTranslationResponse {
  id: number;
  locale: string;
  name: string;
  description: string | null;
}

export interface FunctionalityLanguageInput {
  id: number | null;
  languageId: number;
}

export interface FunctionalityLanguageResponse {
  id: number;
  languageId: number;
}

export interface SaveFunctionalityRequest {
  id: number | null;
  moduleId: number;
  parentId: number | null;
  slug: string;
  icon: string | null;
  order: number;
  isNavigationGroup: boolean;
  isActive: boolean;
  translations: FunctionalityTranslationInput[];
  languageLinks: FunctionalityLanguageInput[];
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
  clientId: number;
  translations: FunctionalityTranslationResponse[];
  languageLinks: FunctionalityLanguageResponse[];
}
