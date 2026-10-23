import { getTranslations } from 'next-intl/server';

export async function ForgotPasswordView() {
  const t = await getTranslations('auth.password_recovery');

  return <main>{t('title')}</main>;
}
