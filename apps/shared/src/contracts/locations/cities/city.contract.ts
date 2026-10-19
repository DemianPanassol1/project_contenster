export interface CityTranslationInput {
  locale: string;
  name: string;
  description: string | null;
}

export type CityTranslationResponse = CityTranslationInput;

export interface SaveCityRequest {
  id: number | null;
  stateId: number;
  ibgeCode: string | null;
  isActive: boolean;
  translations: CityTranslationInput[];
}

export interface CityListItem {
  id: number;
  stateId: number;
  stateCode: string;
  stateName: string;
  countryId: number;
  countryName: string;
  ibgeCode: string | null;
  isActive: boolean;
  name: string;
}

export interface GetCityByIdResponse extends CityListItem {
  translations: CityTranslationResponse[];
}
