'use client';

import type { PortalListItem } from '@contenster/shared';
import { Paper } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useRouter } from '@/i18n/navigation';
import { API_ROUTES } from '@/routes';
import { Button, DataTable, Page } from '@/shared';

import { usePortalColumns } from '../hooks/usePortalColumns';

export function SystemAdminPortalsListView() {
  const router = useRouter();
  const t = useTranslations('protected.system_admin.portals');
  const tSystem = useTranslations('protected.system_admin');
  const columns = usePortalColumns();

  return (
    <Page
      actions={
        <Button
          icon="plus"
          iconPosition="start"
          label={t('create')}
          onClick={() => router.push('/system-admin/portals/new')}
        />
      }
      description={t('description')}
      functionality={t('title')}
      module={tSystem('module')}
    >
      <Paper elevation={1} square={false} sx={{ px: 2, py: 3 }}>
        <DataTable<PortalListItem>
          bulkDeleteEndpoint={API_ROUTES.SYSTEM_ADMIN.POST_PORTAL_DELETE}
          canDelete
          canEdit
          canExport={false}
          columns={columns}
          deleteConfirmation={{
            cancelLabel: t('cancel'),
            confirmLabel: t('delete'),
            manyConfirmLabel: t('delete'),
            manyMessage: (count) => t('delete_many_message', { count }),
            message: t('delete_message'),
            selectionBarLabel: t('delete_selected'),
            title: t('delete_title'),
          }}
          endpoint={API_ROUTES.SYSTEM_ADMIN.POST_PORTAL_LIST}
          getRowEditPath={(row) => `/system-admin/portals/update/${row.id}`}
          getRowId={(row) => row.id}
          selectable
          showRowDeleteAction
          showRowEditAction
        />
      </Paper>
    </Page>
  );
}
