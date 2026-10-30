import { getTranslations } from 'next-intl/server';

import { SystemAdminFeatureSkeleton } from '@/features/system-admin/shared/SystemAdminFeatureSkeleton';

export async function SystemAdminFilesView() {
  const t = await getTranslations('protected.system_admin.files');
  const tSystem = await getTranslations('protected.system_admin');

  return (
    <SystemAdminFeatureSkeleton
      description={t('description')}
      functionality={t('title')}
      module={tSystem('module')}
    />
  );
}
