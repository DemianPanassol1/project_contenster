import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { AdminProviders } from '@/core/providers';
import { AdminColorSchemeScript } from '@/core/theme';
import { isLocale } from '@/i18n/routing';
import { SystemLayout } from '@/layouts';

interface SystemAdminRouteLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function SystemAdminRouteLayout({
  children,
  params,
}: SystemAdminRouteLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const t = await getTranslations('protected.feedback');

  return (
    <>
      <AdminColorSchemeScript />
      <AdminProviders closeSnackbarLabel={t('close_snackbar')} locale={locale}>
        <SystemLayout>{children}</SystemLayout>
      </AdminProviders>
    </>
  );
}
