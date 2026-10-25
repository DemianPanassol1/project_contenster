import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { AuthProviders, PortalColorSchemeScript, PortalProvider } from '@/core/providers';
import { redirect } from '@/i18n/navigation';
import { isLocale } from '@/i18n/routing';
import { AuthLayout } from '@/layouts';
import { getPublicPortal, getSession } from '@/services/actions';
import { isClientSession, isGlobalSuperuserSession } from '@/services/session';

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
  const session = await getSession();

  if (isGlobalSuperuserSession(session)) {
    redirect({ href: '/system-admin', locale });
  }

  if (isClientSession(session)) {
    redirect({ href: '/admin', locale });
  }

  const portal = await getPublicPortal();

  return (
    <>
      <PortalColorSchemeScript />
      <PortalProvider portal={portal}>
        <AuthProviders closeSnackbarLabel={t('close_snackbar')} portal={portal}>
          <AuthLayout>{children}</AuthLayout>
        </AuthProviders>
      </PortalProvider>
    </>
  );
}
