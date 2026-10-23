import { getTranslations } from 'next-intl/server';

export async function ResetPasswordView() {
  const t = await getTranslations('auth.password_reset');

  return <main>{t('title')}</main>;
}
