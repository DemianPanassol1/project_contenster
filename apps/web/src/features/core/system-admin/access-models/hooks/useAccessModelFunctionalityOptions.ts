import {
  type AccessModelFunctionalityDefinition,
  type AccessModelModuleDefinition,
  FUNCTIONALITY_CATALOG,
  type SessionLanguage,
} from '@contenster/shared';
import type { SelectOption } from '@/services/hooks';

import { getAccessModelLocalizedName } from '../utils/access-model.utils';

export function useAccessModelFunctionalityOptions({
  functionalities,
  modules,
  languages,
  locale,
  slug,
}: {
  functionalities: AccessModelFunctionalityDefinition[];
  modules: AccessModelModuleDefinition[];
  languages: SessionLanguage[];
  locale: string;
  slug: string;
}) {
  const used = new Set(
    modules.flatMap((module) => module.functionalities.map((item) => item.slug)),
  );
  const descendants = new Set<string>([slug]);
  let changed = true;

  while (changed) {
    changed = false;

    for (const item of functionalities) {
      if (item.parentSlug && descendants.has(item.parentSlug) && !descendants.has(item.slug)) {
        descendants.add(item.slug);
        changed = true;
      }
    }
  }

  const option = (value: string, label: string): SelectOption => ({
    value,
    label,
    metadata: null,
    disabled: false,
  });

  return {
    languageOptions: languages.map((language) => option(language.locale, language.name)),
    parentOptions: functionalities
      .filter((item) => item.slug && !descendants.has(item.slug))
      .map((item) =>
        option(item.slug, getAccessModelLocalizedName(item.translations, locale) || item.slug),
      ),
    slugOptions: FUNCTIONALITY_CATALOG.filter(
      (item) => item.slug === slug || !used.has(item.slug),
    ).map((item) => option(item.slug, item.slug)),
  };
}
