export interface CountryTranslationInput {
  locale: string;
  name: string;
  description: string | null;
}
export type CountryTranslationResponse = CountryTranslationInput;
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
