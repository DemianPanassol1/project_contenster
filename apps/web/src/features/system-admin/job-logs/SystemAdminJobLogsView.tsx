'use client';

import type { CronExecutionLogDetail, CronExecutionLogListItem } from '@contenster/shared';
import { Paper } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useGlobalContext, useModalContext } from '@/core/providers';
import { API_ROUTES } from '@/routes';
import { DataTable, Page } from '@/shared';

import { SystemAdminJobLogDetailsContent } from './components/SystemAdminJobLogDetailsContent';
import { useSystemAdminJobLogColumns } from './hooks/useSystemAdminJobLogColumns';

export function SystemAdminJobLogsView() {
  const t = useTranslations('protected.system_admin.job_logs');
  const tSystem = useTranslations('protected.system_admin');
  const { apiRequest } = useGlobalContext();
  const { openModal } = useModalContext();
  const columns = useSystemAdminJobLogColumns();

  const openDetails = async (log: CronExecutionLogListItem) => {
    const response = await apiRequest<CronExecutionLogDetail>({
      endpoint: API_ROUTES.SYSTEM_ADMIN.GET_JOB_LOG(log.id),
      method: 'GET',
      showSuccessMessage: false,
    });

    if (!response.success || !response.body) return;

    openModal({
      actions: [{ closeOnClick: true, label: t('close'), variant: 'contained' }],
      content: <SystemAdminJobLogDetailsContent log={response.body} />,
      maxWidth: 'md',
      title: t('details_title'),
    });
  };

  return (
    <Page description={t('description')} functionality={t('title')} module={tSystem('module')}>
      <Paper elevation={1} square={false} sx={{ px: 2, py: 3 }}>
        <DataTable<CronExecutionLogListItem>
          actions={[{ icon: 'eye', label: t('details'), onClick: (row) => openDetails(row) }]}
          canDelete={false}
          canEdit={false}
          canExport={false}
          columns={columns}
          endpoint={API_ROUTES.SYSTEM_ADMIN.POST_JOB_LOG_LIST}
          getRowId={(row) => row.id}
        />
      </Paper>
    </Page>
  );
}
