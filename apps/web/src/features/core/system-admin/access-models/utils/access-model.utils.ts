import type {
  AccessModelFunctionalityDefinition,
  AccessModelModuleDefinition,
  GetAccessModelByIdResponse,
  SaveAccessModelRequest,
  SessionLanguage,
} from '@contenster/shared';

export function getAccessModelLocalizedName(
  translations: Array<{ locale: string; name?: string | null }> | undefined,
  locale: string,
): string {
  const code = locale.split('-')[0];

  return (
    translations?.find((item) => item.locale === code && item.name?.trim())?.name ??
    translations?.find((item) => item.name?.trim())?.name ??
    ''
  );
}

export function createAccessModelFunctionality(
  languages: SessionLanguage[],
  order: number,
): AccessModelFunctionalityDefinition {
  return {
    slug: '',
    parentSlug: null,
    icon: null,
    order,
    isActive: true,
    isNavigationGroup: false,
    enabledLanguageCodes: languages.map((language) => language.locale),
    translations: languages.map((language) => ({
      locale: language.locale,
      name: '',
      description: null,
    })),
  };
}

export function createAccessModelModuleKey(keys: Set<string>): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';

  do {
    const bytes = crypto.getRandomValues(new Uint8Array(8));
    const suffix = Array.from(bytes, (byte) => characters[byte % characters.length]).join('');

    key = `MOD_${suffix}`;
  } while (keys.has(key));

  return key;
}

export function createAccessModelModule(
  languages: SessionLanguage[],
  order: number,
  key: string | null = null,
): AccessModelModuleDefinition {
  return {
    key,
    order,
    isActive: true,
    translations: languages.map((language) => ({
      locale: language.locale,
      name: '',
      description: null,
    })),
    functionalities: [],
  };
}

export function getAccessModelDefaultValues(languages: SessionLanguage[]): SaveAccessModelRequest {
  return {
    id: null,
    isActive: true,
    structure: { modules: [createAccessModelModule(languages, 0)] },
    translations: languages.map((language) => ({
      id: null,
      locale: language.locale,
      name: '',
      description: null,
    })),
  };
}

export function mapAccessModelContent(
  model: GetAccessModelByIdResponse,
  languages: SessionLanguage[],
): SaveAccessModelRequest {
  const hydrate = <T extends { locale: string; name: string; description: string | null }>(
    translations: T[],
  ) => [
    ...translations,
    ...languages
      .filter((language) => !translations.some((item) => item.locale === language.locale))
      .map((language) => ({ locale: language.locale, name: '', description: null })),
  ];
  return {
    id: model.id,
    isActive: model.isActive,
    translations: [
      ...model.translations,
      ...languages
        .filter((language) => !model.translations.some((item) => item.locale === language.locale))
        .map((language) => ({ id: null, locale: language.locale, name: '', description: null })),
    ],
    structure: {
      modules: [...model.structure.modules]
        .sort((a, b) => a.order - b.order)
        .map((module) => ({
          ...module,
          translations: hydrate(module.translations),
          functionalities: [...module.functionalities]
            .sort((a, b) => a.order - b.order)
            .map((item) => ({ ...item, translations: hydrate(item.translations) })),
        })),
    },
  };
}

export function mapAccessModelPayload(values: SaveAccessModelRequest): SaveAccessModelRequest {
  const normalizeDescription = <T extends { description: string | null }>(translation: T): T => ({
    ...translation,
    description: translation.description?.trim() ? translation.description : null,
  });

  return {
    ...values,
    translations: values.translations.map(normalizeDescription),
    structure: {
      modules: values.structure.modules.map((module) => ({
        ...module,
        translations: module.translations.map(normalizeDescription),
        functionalities: module.functionalities.map((functionality) => ({
          ...functionality,
          translations: functionality.translations
            .filter((translation) =>
              functionality.enabledLanguageCodes.includes(translation.locale),
            )
            .map(normalizeDescription),
        })),
      })),
    },
  };
}
