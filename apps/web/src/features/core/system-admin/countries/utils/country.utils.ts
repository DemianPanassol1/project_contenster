import type {
  GetCountryByIdResponse,
  SaveCountryRequest,
  SessionLanguage,
} from '@contenster/shared';

export const getCountryDefaultValues = (languages: SessionLanguage[]): SaveCountryRequest => ({
  currencyCode: null,
  id: null,
  isActive: true,
  iso2: '',
  iso3: null,
  locale: null,
  phoneCode: null,
  translations: languages.map((language) => ({ id: null, locale: language.locale, name: '' })),
});

export const mapCountryContent = (
  content: GetCountryByIdResponse,
  languages: SessionLanguage[],
): SaveCountryRequest => ({
  currencyCode: content.currencyCode,
  id: content.id,
  isActive: content.isActive,
  iso2: content.iso2,
  iso3: content.iso3,
  locale: content.locale,
  phoneCode: content.phoneCode,
  translations: languages.map((language) => {
    const translation = content.translations.find((item) => item.locale === language.locale);

    return { id: translation?.id ?? null, locale: language.locale, name: translation?.name ?? '' };
  }),
});

const toOptionalValue = (value: string | null): string | null => value?.trim() || null;

export const mapCountryPayload = (values: SaveCountryRequest): SaveCountryRequest => ({
  ...values,
  currencyCode: toOptionalValue(values.currencyCode)?.toUpperCase() ?? null,
  iso2: values.iso2.trim().toUpperCase(),
  iso3: toOptionalValue(values.iso3)?.toUpperCase() ?? null,
  locale: toOptionalValue(values.locale)?.toLowerCase() ?? null,
  phoneCode: toOptionalValue(values.phoneCode),
  translations: values.translations.map((translation) => ({
    ...translation,
    name: translation.name.trim(),
  })),
});
