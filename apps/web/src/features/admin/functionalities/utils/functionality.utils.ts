import type {
  GetFunctionalityByIdResponse,
  SaveFunctionalityRequest,
  SessionLanguage,
} from '@contenster/shared';

import type { FunctionalityFormValues } from '../types/functionality-form.types';

export const getFunctionalityDefaultValues = (
  languages: SessionLanguage[],
): FunctionalityFormValues => ({
  icon: null,
  id: null,
  isActive: true,
  isNavigationGroup: false,
  languageLinks: languages.map((language) => ({ id: null, languageId: language.id })),
  languageIds: languages.map((language) => language.id),
  moduleId: 0,
  order: 0,
  parentId: null,
  slug: '',
  translations: languages.map((language) => ({
    description: null,
    id: null,
    locale: language.locale,
    name: '',
  })),
});
export const mapFunctionalityContent = (
  content: GetFunctionalityByIdResponse,
  languages: SessionLanguage[],
): FunctionalityFormValues => ({
  icon: content.icon,
  id: content.id,
  isActive: content.isActive,
  isNavigationGroup: content.isNavigationGroup,
  languageLinks: content.languageLinks,
  languageIds: content.languageLinks.map((link) => link.languageId),
  moduleId: content.moduleId,
  order: content.order,
  parentId: content.parentId,
  slug: content.slug,
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
export const mapFunctionalityPayload = (
  values: FunctionalityFormValues,
  languages: SessionLanguage[],
): SaveFunctionalityRequest => {
  const linkIdByLanguageId = new Map(
    values.languageLinks.map((link) => [link.languageId, link.id]),
  );
  const enabledLanguageIds = new Set(values.languageIds);
  const enabledLocales = new Set(
    languages
      .filter((language) => enabledLanguageIds.has(language.id))
      .map((language) => language.locale),
  );
  const { languageIds: _languageIds, languageLinks: _languageLinks, ...functionality } = values;

  return {
    ...functionality,
    languageLinks: values.languageIds.map((languageId) => ({
      id: linkIdByLanguageId.get(languageId) ?? null,
      languageId,
    })),
    translations: values.translations.filter((translation) =>
      enabledLocales.has(translation.locale),
    ),
  };
};
