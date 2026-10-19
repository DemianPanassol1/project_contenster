export interface CountryTranslationInput {
  id: number | null;
  locale: string;
  name: string;
}
export interface CountryTranslationResponse {
  id: number;
  locale: string;
  name: string;
}
export interface SaveCountryRequest {
  id: number | null;
  iso2: string;
  iso3: string | null;
  phoneCode: string | null;
  currencyCode: string | null;
  locale: string | null;
  isActive: boolean;
  translations: CountryTranslationInput[];
}
export interface CountryListItem {
  id: number;
  iso2: string;
  iso3: string | null;
  isActive: boolean;
  name: string;
}
export interface GetCountryByIdResponse extends CountryListItem {
  phoneCode: string | null;
  currencyCode: string | null;
  locale: string | null;
  translations: CountryTranslationResponse[];
}
