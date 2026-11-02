import type { GetStateByIdResponse, SaveStateRequest, SessionLanguage } from '@contenster/shared';

export const getStateDefaultValues = (languages: SessionLanguage[]): SaveStateRequest => ({
  code: '',
  countryId: 0,
  id: null,
  isActive: true,
  translations: languages.map((language) => ({ id: null, locale: language.locale, name: '' })),
});

export const mapStateContent = (
  content: GetStateByIdResponse,
  languages: SessionLanguage[],
): SaveStateRequest => ({
  code: content.code,
  countryId: content.countryId,
  id: content.id,
  isActive: content.isActive,
  translations: languages.map((language) => {
    const translation = content.translations.find((item) => item.locale === language.locale);

    return { id: translation?.id ?? null, locale: language.locale, name: translation?.name ?? '' };
  }),
});

export const mapStatePayload = (values: SaveStateRequest): SaveStateRequest => ({
  ...values,
  code: values.code.trim().toUpperCase(),
  translations: values.translations.map((translation) => ({
    ...translation,
    name: translation.name.trim(),
  })),
});
