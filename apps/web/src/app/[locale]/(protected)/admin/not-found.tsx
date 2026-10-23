import { getTranslations } from 'next-intl/server';

export default async function AdminNotFound() {
  const t = await getTranslations('protected.not_found');

  return <main>{t('message')}</main>;
}
