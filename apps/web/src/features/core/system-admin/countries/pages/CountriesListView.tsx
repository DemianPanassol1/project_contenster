'use client';

import type { CountryListItem } from '@contenster/shared';
import { Paper } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useRouter } from '@/i18n/navigation';
import { API_ROUTES } from '@/routes';
import { Button, DataTable, Page } from '@/shared';

import { useCountryColumns } from '../hooks/useCountryColumns';

export function SystemAdminCountriesListView() {
  const router = useRouter();
  const t = useTranslations('protected.countries');
  const columns = useCountryColumns();
  const tSystem = useTranslations('protected.system_admin');
  return (
    <Page
      actions={
        <Button
          icon="plus"
          iconPosition="start"
          label={t('create_register')}
          onClick={() => router.push('/system-admin/countries/new')}
        />
      }
      functionality={t('title')}
      module={tSystem('module')}
    >
      <Paper elevation={1} square={false} sx={{ px: 2, py: 3 }}>
        <DataTable<CountryListItem>
          bulkDeleteEndpoint={API_ROUTES.SYSTEM_ADMIN.DELETE_COUNTRIES}
          canDelete
          canEdit
          canExport
          columns={columns}
          deleteConfirmation={{
            cancelLabel: t('cancel'),
            confirmLabel: t('delete'),
            manyConfirmLabel: t('delete'),
            manyMessage: (count) => t('delete_many_message', { count: String(count) }),
            message: t('delete_message'),
            selectionBarLabel: t('delete_selected'),
            title: t('delete_title'),
          }}
          endpoint={API_ROUTES.SYSTEM_ADMIN.POST_COUNTRY_LIST}
          getRowEditPath={(_row, id) => `/system-admin/countries/update/${id}`}
          getRowId={(row) => row.id}
          selectable
          showRowDeleteAction
          showRowEditAction
          onDeleteSuccess={() => router.refresh()}
        />
      </Paper>
    </Page>
  );
}
