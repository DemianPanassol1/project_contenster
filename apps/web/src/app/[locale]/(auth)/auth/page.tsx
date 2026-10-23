import { redirect } from '@/i18n/navigation';

type AuthPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AuthPage({ params }: AuthPageProps) {
  const { locale } = await params;

  redirect({ href: '/auth/login', locale });
}
