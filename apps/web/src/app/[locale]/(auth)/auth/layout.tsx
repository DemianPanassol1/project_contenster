import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { AuthProviders } from '@/core/providers';
import { AdminColorSchemeScript } from '@/core/theme';
import { isLocale } from '@/i18n/routing';
import { AuthLayout } from '@/layouts';

interface AuthRouteLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AuthRouteLayout({ children, params }: AuthRouteLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const t = await getTranslations('auth.feedback');

  return (
    <>
      <AdminColorSchemeScript />
      <AuthProviders closeSnackbarLabel={t('close_snackbar')}>
        <AuthLayout>{children}</AuthLayout>
      </AuthProviders>
    </>
  );
}
