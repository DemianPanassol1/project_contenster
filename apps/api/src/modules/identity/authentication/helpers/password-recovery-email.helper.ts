import type { PasswordRecoveryEmailLocale } from '../types/password-recovery-email.type';

export const resolvePasswordRecoveryEmailLocale = (locale: string): PasswordRecoveryEmailLocale => {
  if (locale === 'en') return 'en';
  if (locale === 'es') return 'es';

  return 'pt';
};

export const escapePasswordRecoveryEmailHtml = (value: string): string =>
  value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };

    return entities[character];
  });
