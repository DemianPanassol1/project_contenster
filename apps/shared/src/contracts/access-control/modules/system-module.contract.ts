export interface SystemModuleTranslationInput {
  locale: string;
  name: string;
  description: string | null;
}

export type SystemModuleTranslationResponse = SystemModuleTranslationInput;

export interface SaveSystemModuleRequest {
  id: number | null;
  order: number;
  isActive: boolean;
  translations: SystemModuleTranslationInput[];
}

export interface SystemModuleListItem {
  id: number;
  order: number;
  isActive: boolean;
  name: string;
  description: string | null;
}

export interface GetSystemModuleByIdResponse extends SystemModuleListItem {
  translations: SystemModuleTranslationResponse[];
}
