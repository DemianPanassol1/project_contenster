'use client';

import type {
  SystemAdminRequestLogDetail,
  SystemAdminRequestLogListItem,
} from '@contenster/shared';
import { Paper } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useGlobalContext, useModalContext } from '@/core/providers';
import { API_ROUTES } from '@/routes';
import { DataTable, Page } from '@/shared';

import { SystemAdminRequestLogDetailsContent } from './components/SystemAdminRequestLogDetailsContent';
import { useSystemAdminRequestLogColumns } from './hooks/useSystemAdminRequestLogColumns';

export function SystemAdminRequestLogsView() {
  const t = useTranslations('protected.system_admin.request_logs');
  const tSystem = useTranslations('protected.system_admin');
  const { apiRequest } = useGlobalContext();
  const { openModal } = useModalContext();
  const columns = useSystemAdminRequestLogColumns();

  const openDetails = async (log: SystemAdminRequestLogListItem) => {
    const response = await apiRequest<SystemAdminRequestLogDetail>({
      endpoint: API_ROUTES.SYSTEM_ADMIN.GET_REQUEST_LOG(log.id),
      method: 'GET',
      showSuccessMessage: false,
    });

    if (!response.success || !response.body) return;

    openModal({
      actions: [{ closeOnClick: true, label: t('close'), variant: 'contained' }],
      content: <SystemAdminRequestLogDetailsContent log={response.body} />,
      maxWidth: 'lg',
      title: t('details_title'),
    });
  };

  return (
    <Page description={t('description')} functionality={t('title')} module={tSystem('module')}>
      <Paper elevation={1} square={false} sx={{ px: 2, py: 3 }}>
        <DataTable<SystemAdminRequestLogListItem>
          actions={[{ icon: 'eye', label: t('details'), onClick: (row) => openDetails(row) }]}
          canDelete={false}
          canEdit={false}
          canExport={false}
          columns={columns}
          endpoint={API_ROUTES.SYSTEM_ADMIN.POST_REQUEST_LOG_LIST}
          getRowId={(row) => row.id}
        />
      </Paper>
    </Page>
  );
}
