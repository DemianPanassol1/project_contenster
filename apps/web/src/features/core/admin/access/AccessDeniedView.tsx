import { getTranslations } from 'next-intl/server';

import { AdminAccessStateView } from './AdminAccessStateView';

export async function AccessDeniedView() {
  const t = await getTranslations('protected.access_denied');

  return (
    <AdminAccessStateView
      actionLabel={t('back_to_home')}
      contentDescription={t('content_description')}
      contentTitle={t('content_title')}
      description={t('description')}
      icon="shield"
      module={t('module')}
      severity="warning"
      title={t('title')}
    />
  );
}
