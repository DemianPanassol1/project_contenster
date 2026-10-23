import { getTranslations } from 'next-intl/server';

export async function ChangePasswordView() {
  const t = await getTranslations('auth.password_change');

  return <main>{t('title')}</main>;
}
