import { getTranslations } from 'next-intl/server';

export default async function SystemAdminNotFound() {
  const t = await getTranslations('protected.system_admin');

  return <main>{t('not_found')}</main>;
}
