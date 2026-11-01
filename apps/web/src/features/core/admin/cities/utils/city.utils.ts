import type { GetCityByIdResponse, SaveCityRequest, SessionLanguage } from '@contenster/shared';

export const getCityDefaultValues = (languages: SessionLanguage[]): SaveCityRequest => ({
  ibgeCode: null,
  id: null,
  isActive: true,
  stateId: 0,
  translations: languages.map((language) => ({ id: null, locale: language.locale, name: '' })),
});

export const mapCityContent = (
  content: GetCityByIdResponse,
  languages: SessionLanguage[],
): SaveCityRequest => ({
  ibgeCode: content.ibgeCode,
  id: content.id,
  isActive: content.isActive,
  stateId: content.stateId,
  translations: languages.map((language) => {
    const translation = content.translations.find((item) => item.locale === language.locale);

    return { id: translation?.id ?? null, locale: language.locale, name: translation?.name ?? '' };
  }),
});

export const mapCityPayload = (values: SaveCityRequest): SaveCityRequest => ({
  ...values,
  ibgeCode: values.ibgeCode?.trim() || null,
  translations: values.translations.map((translation) => ({
    ...translation,
    name: translation.name.trim(),
  })),
});
