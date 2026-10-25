import { getTranslations } from 'next-intl/server';

export async function SystemAdminHomeView() {
  const t = await getTranslations('protected.system_admin');

  return <h2>{t('home_title')}</h2>;
}
