import { getTranslations } from 'next-intl/server';

export async function LoginView() {
  const t = await getTranslations('auth.login');

  return <main>{t('title')}</main>;
}
