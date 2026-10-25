import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { AdminProviders } from '@/core/providers';
import { AdminColorSchemeScript } from '@/core/theme';
import { isLocale } from '@/i18n/routing';
import { AdminLayout } from '@/layouts';

interface AdminRouteLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminRouteLayout({ children, params }: AdminRouteLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const t = await getTranslations('protected.feedback');

  return (
    <>
      <AdminColorSchemeScript />
      <AdminProviders closeSnackbarLabel={t('close_snackbar')} locale={locale}>
        <AdminLayout>{children}</AdminLayout>
      </AdminProviders>
    </>
  );
}
