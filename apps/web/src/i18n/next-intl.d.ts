import type messages from './messages/pt';
import type { Locale } from './routing';

declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
  }
}
