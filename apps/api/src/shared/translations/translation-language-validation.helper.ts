import { BadRequestException } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

import type { I18nTranslations } from '@/i18n/translations';

type TranslationLanguage = { languageCode: string };

type AllowedKeys =
  'errors.translations.language_not_found' | 'errors.translations.translation_language_duplicate';

const translateCurrentRequest = (key: AllowedKeys): string =>
  I18nContext.current<I18nTranslations>()?.t(key) ?? key;

export const resolveTranslationLanguages = <TLanguage extends TranslationLanguage>(
  requestedLanguageCodes: readonly string[],
  languages: readonly TLanguage[],
): Map<string, TLanguage> => {
  if (new Set(requestedLanguageCodes).size !== requestedLanguageCodes.length) {
    throw new BadRequestException(
      translateCurrentRequest('errors.translations.translation_language_duplicate'),
    );
  }

  const languageByCode = new Map(languages.map((language) => [language.languageCode, language]));

  if (requestedLanguageCodes.some((languageCode) => !languageByCode.has(languageCode))) {
    throw new BadRequestException(
      translateCurrentRequest('errors.translations.language_not_found'),
    );
  }

  return languageByCode;
};
