'use client';

import type { SystemAdminFileListItem } from '@contenster/shared';
import { Paper } from '@mui/material';
import { useTranslations } from 'next-intl';

import { openStorageFileUrl } from '@/features/admin/client-storage/utils/client-storage.utils';
import { API_ROUTES } from '@/routes';
import { DataTable, Page } from '@/shared';

import { useSystemAdminFileColumns } from './hooks/useSystemAdminFileColumns';

export function SystemAdminFilesView() {
  const t = useTranslations('protected.system_admin.files');
  const tSystem = useTranslations('protected.system_admin');
  const columns = useSystemAdminFileColumns();

  return (
    <Page description={t('description')} functionality={t('title')} module={tSystem('module')}>
      <Paper elevation={1} square={false} sx={{ px: 2, py: 3 }}>
        <DataTable<SystemAdminFileListItem>
          actions={[
            {
              disabled: (row) => !row.url,
              icon: 'eye',
              label: t('open_file'),
              onClick: (row) => openStorageFileUrl(row.url),
            },
          ]}
          canDelete={false}
          canEdit={false}
          canExport={false}
          columns={columns}
          endpoint={API_ROUTES.SYSTEM_ADMIN.POST_FILE_LIST}
          getRowId={(row) => row.id}
        />
      </Paper>
    </Page>
  );
}
