import { join } from 'node:path';
import type { ExecutionContext } from '@nestjs/common';
import { I18nJsonLoader, type I18nResolver } from 'nestjs-i18n';

export const DEFAULT_API_LOCALE = 'pt';
export const API_I18N_TRANSLATIONS_PATH = join(__dirname, 'translations');

const SUPPORTED_API_LOCALES = new Set(['pt', 'en', 'es']);

class RequestLocaleResolver implements I18nResolver {
  resolve(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, unknown> }>();
    const requestedLocale = request.headers['x-lang'];

    if (typeof requestedLocale !== 'string') return DEFAULT_API_LOCALE;

    const normalizedLocale = requestedLocale.trim().toLowerCase().split('-')[0];

    return SUPPORTED_API_LOCALES.has(normalizedLocale) ? normalizedLocale : DEFAULT_API_LOCALE;
  }
}

export const createI18nOptions = () => ({
  fallbackLanguage: DEFAULT_API_LOCALE,
  loader: I18nJsonLoader,
  loaderOptions: {
    path: API_I18N_TRANSLATIONS_PATH,
    watch: process.env.NODE_ENV !== 'production',
  },
  resolvers: [new RequestLocaleResolver()],
});
