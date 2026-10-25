import { notFound } from 'next/navigation';

import { redirect } from '@/i18n/navigation';
import { isLocale } from '@/i18n/routing';

type AuthPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AuthPage({ params }: AuthPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  redirect({ href: '/auth/login', locale });
}
