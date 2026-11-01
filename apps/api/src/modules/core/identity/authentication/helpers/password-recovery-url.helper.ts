import { DEFAULT_API_LOCALE } from '@/i18n/i18n.config';

import type { PasswordRecoveryEmailLocale } from '../types/password-recovery-email.type';

const DEFAULT_PASSWORD_RECOVERY_LOCALE: PasswordRecoveryEmailLocale = 'pt';

export const resolvePasswordRecoveryLocale = (locale: string): PasswordRecoveryEmailLocale => {
  if (locale === 'en') return 'en';
  if (locale === 'es') return 'es';

  return DEFAULT_PASSWORD_RECOVERY_LOCALE;
};

export const buildPasswordRecoveryPath = (locale: string, token: string): string => {
  const resolvedLocale = resolvePasswordRecoveryLocale(locale);
  const localePrefix = resolvedLocale === DEFAULT_API_LOCALE ? '' : `/${resolvedLocale}`;

  return `${localePrefix}/auth/reset-password/${encodeURIComponent(token)}`;
};
