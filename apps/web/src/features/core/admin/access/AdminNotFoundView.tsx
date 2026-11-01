import { getTranslations } from 'next-intl/server';

import { AdminAccessStateView } from './AdminAccessStateView';

export async function AdminNotFoundView() {
  const t = await getTranslations('protected.not_found');

  return (
    <AdminAccessStateView
      actionLabel={t('back_to_home')}
      contentDescription={t('content_description')}
      contentTitle={t('content_title')}
      description={t('description')}
      icon="scan-search"
      module={t('module')}
      severity="info"
      title={t('title')}
    />
  );
}
