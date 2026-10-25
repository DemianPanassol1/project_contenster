const LANGUAGE_LABEL_KEYS: Record<string, string> = {
  en: 'language.english',
  es: 'language.spanish',
  pt: 'language.portuguese',
};
export const getLanguageLabelKey = (language: { locale: string }): string | null =>
  LANGUAGE_LABEL_KEYS[language.locale] ?? null;
