import { I18nContext } from 'nestjs-i18n';

import { DEFAULT_API_LOCALE } from '@/i18n/i18n.config';
import type { I18nTranslations } from '@/i18n/translations';

export const getCurrentLocale = (): string =>
  I18nContext.current<I18nTranslations>()?.lang ?? DEFAULT_API_LOCALE;
