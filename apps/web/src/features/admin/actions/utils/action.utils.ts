import {
  ActionType,
  type GetActionByIdResponse,
  type SaveActionRequest,
  type SessionLanguage,
} from '@contenster/shared';

export const getActionDefaultValues = (languages: SessionLanguage[]): SaveActionRequest => ({
  id: null,
  translations: languages.map((language) => ({
    description: null,
    id: null,
    locale: language.locale,
    name: '',
  })),
  type: ActionType.view,
});

export const mapActionContent = (
  content: GetActionByIdResponse,
  languages: SessionLanguage[],
): SaveActionRequest => ({
  id: content.id,
  translations: languages.map((language) => {
    const translation = content.translations.find((item) => item.locale === language.locale);

    return {
      description: translation?.description ?? null,
      id: translation?.id ?? null,
      locale: language.locale,
      name: translation?.name ?? '',
    };
  }),
  type: content.type,
});

export const mapActionPayload = (values: SaveActionRequest): SaveActionRequest => ({
  ...values,
  translations: values.translations.map((translation) => ({
    ...translation,
    description: translation.description?.trim() || null,
    name: translation.name.trim(),
  })),
});
