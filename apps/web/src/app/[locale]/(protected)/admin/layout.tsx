import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { AdminProviders, PortalColorSchemeScript, PortalProvider } from '@/core/providers';
import { redirect } from '@/i18n/navigation';
import { isLocale } from '@/i18n/routing';
import { AdminLayout } from '@/layouts';
import { getPublicPortal, getSession } from '@/services/actions';
import { isClientSession, isGlobalSuperuserSession } from '@/services/session';

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
  const session = await getSession();

  if (isGlobalSuperuserSession(session)) {
    redirect({ href: '/system-admin', locale });
  }

  if (!isClientSession(session)) {
    redirect({ href: '/auth/login', locale });
  }

  const portal = await getPublicPortal();

  return (
    <>
      <PortalColorSchemeScript />
      <PortalProvider portal={portal}>
        <AdminProviders closeSnackbarLabel={t('close_snackbar')} locale={locale} portal={portal}>
          <AdminLayout>{children}</AdminLayout>
        </AdminProviders>
      </PortalProvider>
    </>
  );
}
