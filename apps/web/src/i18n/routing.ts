import { defineRouting } from 'next-intl/routing';

export const locales = ['pt', 'en', 'es'] as const;

export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'pt',
  localePrefix: 'as-needed',
  localeDetection: false,
  localeCookie: false,
});

export const isLocale = (value: string): value is Locale => locales.includes(value as Locale);
