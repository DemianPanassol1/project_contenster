export interface CityTranslationInput {
  id: number | null;
  locale: string;
  name: string;
}

export interface CityTranslationResponse {
  id: number;
  locale: string;
  name: string;
}

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
