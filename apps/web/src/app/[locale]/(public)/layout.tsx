import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { redirect } from '@/i18n/navigation';
import { isLocale } from '@/i18n/routing';

export default async function PublicLayout({
  children,
  params,
}: Readonly<{ children: ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  // eslint-disable-next-line no-constant-condition
  if (true) {
    redirect({ href: '/admin', locale });
  }

  return children;
}
