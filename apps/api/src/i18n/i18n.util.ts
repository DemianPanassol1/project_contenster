import { i18nValidationMessage } from 'nestjs-i18n';

import type { I18nPath, I18nTranslations } from './translations';

export const i18n = (key: I18nPath, args?: Record<string, unknown>) =>
  i18nValidationMessage<I18nTranslations>(key, args);
