import { getTranslations } from 'next-intl/server';

export async function AdminHomeView() {
  const t = await getTranslations('protected.home');

  return <main>{t('title')}</main>;
}
