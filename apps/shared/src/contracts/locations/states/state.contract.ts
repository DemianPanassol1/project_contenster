export interface StateTranslationInput {
  locale: string;
  name: string;
}

export type StateTranslationResponse = StateTranslationInput;

export interface SaveStateRequest {
  id: number | null;
  countryId: number;
  code: string;
  isActive: boolean;
  translations: StateTranslationInput[];
}

export interface StateListItem {
  id: number;
  countryId: number;
  countryName: string;
  code: string;
  isActive: boolean;
  name: string;
}

export interface GetStateByIdResponse extends StateListItem {
  translations: StateTranslationResponse[];
}
