import type {
  GetSystemModuleByIdResponse,
  SaveSystemModuleRequest,
  SessionLanguage,
} from '@contenster/shared';

export const getSystemModuleDefaultValues = (
  languages: SessionLanguage[],
): SaveSystemModuleRequest => ({
  id: null,
  isActive: true,
  order: 0,
  translations: languages.map((language) => ({
    description: null,
    id: null,
    locale: language.locale,
    name: '',
  })),
});

export const mapSystemModuleContent = (
  content: GetSystemModuleByIdResponse,
  languages: SessionLanguage[],
): SaveSystemModuleRequest => ({
  id: content.id,
  isActive: content.isActive,
  order: content.order,
  translations: languages.map((language) => {
    const translation = content.translations.find((item) => item.locale === language.locale);

    return {
      description: translation?.description ?? null,
      id: translation?.id ?? null,
      locale: language.locale,
      name: translation?.name ?? '',
    };
  }),
});

export const mapSystemModulePayload = (
  values: SaveSystemModuleRequest,
): SaveSystemModuleRequest => ({
  ...values,
  order: Number(values.order),
  translations: values.translations.map((translation) => ({
    ...translation,
    description: translation.description?.trim() || null,
    name: translation.name.trim(),
  })),
});
