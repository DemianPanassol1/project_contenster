'use client';

import type { AccessModelListItem } from '@contenster/shared';
import { Paper } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useRouter } from '@/i18n/navigation';
import { API_ROUTES } from '@/routes';
import { Button, DataTable, Page } from '@/shared';

export function SystemAdminAccessModelsView() {
  const t = useTranslations('protected.access_models');
  const router = useRouter();
  return (
    <Page
      module={t('module')}
      functionality={t('title')}
      actions={
        <Button
          icon="plus"
          iconPosition="start"
          label={t('create')}
          onClick={() => router.push('/system-admin/access-models/new')}
        />
      }
    >
      <Paper elevation={1} square={false} sx={{ px: 2, py: 3 }}>
        <DataTable<AccessModelListItem>
          actions={[
            {
              label: t('apply'),
              icon: 'rocket',
              disabled: (row) => !row.isActive,
              onClick: (row) => router.push(`/system-admin/access-models/apply/${row.id}`),
            },
          ]}
          endpoint={API_ROUTES.SYSTEM_ADMIN.POST_ACCESS_MODEL_LIST}
          bulkDeleteEndpoint={API_ROUTES.SYSTEM_ADMIN.DELETE_ACCESS_MODELS}
          deleteConfirmation={{
            cancelLabel: t('cancel'),
            confirmLabel: t('delete'),
            manyConfirmLabel: t('delete'),
            manyMessage: (count) => t('delete_many_message', { count: String(count) }),
            message: t('delete_message'),
            selectionBarLabel: t('delete_selected'),
            title: t('delete_title'),
          }}
          columns={[
            { field: 'name', name: t('name') },
            { field: 'description', name: t('description') },
            { field: 'isActive', name: t('active') },
          ]}
          getRowEditPath={(_row, id) => `/system-admin/access-models/update/${id}`}
          getRowId={(row) => row.id}
          canEdit
          showRowEditAction
          canDelete
          selectable
          showRowDeleteAction
        />
      </Paper>
    </Page>
  );
}
