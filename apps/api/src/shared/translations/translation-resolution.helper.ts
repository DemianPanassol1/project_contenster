import { DEFAULT_API_LOCALE } from '@/i18n/i18n.config';

export type TranslationWithLocale = { locale: string } | { language: { languageCode: string } };

export type TranslationTextField<T> = {
  [Key in keyof T]-?: Exclude<T[Key], null | undefined> extends string ? Key : never;
}[keyof T];

export interface TranslationResolutionOptions {
  fallback?: string;
  fallbackLocale?: string | null;
  nullable?: boolean;
}

const normalizeLocale = (locale: string): string => locale.trim().toLowerCase().split('-')[0];

const getTranslationLocale = <T extends TranslationWithLocale>(translation: T): string =>
  'locale' in translation
    ? normalizeLocale(translation.locale)
    : normalizeLocale(translation.language.languageCode);

export function resolveTranslation<T extends TranslationWithLocale>(
  translations: readonly T[] | null | undefined,
  locale: string,
  field: TranslationTextField<T>,
  options?: TranslationResolutionOptions & { nullable?: false },
): string;
export function resolveTranslation<T extends TranslationWithLocale>(
  translations: readonly T[] | null | undefined,
  locale: string,
  field: TranslationTextField<T>,
  options: TranslationResolutionOptions,
): string | null;
export function resolveTranslation<T extends TranslationWithLocale>(
  translations: readonly T[] | null | undefined,
  locale: string,
  field: TranslationTextField<T>,
  options: TranslationResolutionOptions = {},
): string | null {
  const available = translations ?? [];
  const requestedLocale = normalizeLocale(locale);
  const fallbackLocale = options.fallbackLocale ?? DEFAULT_API_LOCALE;
  const translation =
    available.find((item) => getTranslationLocale(item) === requestedLocale) ??
    available.find((item) => getTranslationLocale(item) === normalizeLocale(fallbackLocale)) ??
    available[0];
  const value = translation?.[field];

  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  return options.fallback ?? (options.nullable ? null : '-');
}
