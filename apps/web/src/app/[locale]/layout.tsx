import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import type { ReactNode } from 'react';

import { locales } from '@/i18n/routing';
import { getPublicPortal } from '@/services/actions';

type LocaleLayoutProps = Readonly<{
  children: ReactNode;
}>;

export function generateStaticParams(): { locale: string }[] {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const portal = await getPublicPortal();

  return {
    description: portal.identity.applicationDescription,
    icons: portal.identity.favicon ? { icon: portal.identity.favicon.url } : undefined,
    title: portal.identity.applicationName,
  };
}

export default async function LocaleLayout({ children }: LocaleLayoutProps) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={await getMessages()}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
