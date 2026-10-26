import type {
  GetFunctionalityByIdResponse,
  SaveFunctionalityRequest,
  SessionLanguage,
} from '@contenster/shared';

export const getFunctionalityDefaultValues = (
  languages: SessionLanguage[],
): SaveFunctionalityRequest => ({
  icon: null,
  id: null,
  isActive: true,
  isNavigationGroup: false,
  languageLinks: languages.map((language) => ({ id: null, languageId: language.id })),
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
): SaveFunctionalityRequest => ({
  icon: content.icon,
  id: content.id,
  isActive: content.isActive,
  isNavigationGroup: content.isNavigationGroup,
  languageLinks: content.languageLinks,
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
  values: SaveFunctionalityRequest,
): SaveFunctionalityRequest => ({
  ...values,
  order: Number(values.order),
  slug: values.slug.trim(),
  translations: values.translations.map((translation) => ({
    ...translation,
    description: translation.description?.trim() || null,
    name: translation.name.trim(),
  })),
});
