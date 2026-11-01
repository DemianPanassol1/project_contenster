'use client';

import type { RequestLogDetail, RequestLogListItem } from '@contenster/shared';
import { Paper } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useGlobalContext, useModalContext } from '@/core/providers';
import type { AdminFeatureViewProps } from '@/registry/admin';
import { API_ROUTES } from '@/routes';
import { DataTable, Page } from '@/shared';

import { RequestLogDetailsContent } from '../components/RequestLogDetailsContent';
import { useRequestLogColumns } from '../hooks/useRequestLogColumns';

export function ClientLogsListView({ presentation }: AdminFeatureViewProps) {
  const t = useTranslations('protected.client_logs');
  const { apiRequest } = useGlobalContext();
  const { openModal } = useModalContext();
  const columns = useRequestLogColumns();

  const openDetails = async (log: RequestLogListItem) => {
    const response = await apiRequest<RequestLogDetail>({
      endpoint: API_ROUTES.ADMIN.GET_CLIENT_REQUEST_LOG(log.id),
      method: 'GET',
      showSuccessMessage: false,
    });

    if (!response.success || !response.body) {
      return;
    }

    openModal({
      actions: [
        {
          closeOnClick: true,
          label: t('close'),
          variant: 'contained',
        },
      ],
      content: <RequestLogDetailsContent log={response.body} />,
      maxWidth: 'lg',
      title: t('details_title'),
    });
  };

  return (
    <Page
      description={presentation.description ?? undefined}
      functionality={presentation.functionalityName}
      module={presentation.moduleName}
    >
      <Paper elevation={1} square={false} sx={{ px: 2, py: 3 }}>
        <DataTable<RequestLogListItem>
          actions={[
            {
              icon: 'eye',
              label: t('details'),
              onClick: (row) => openDetails(row),
            },
          ]}
          canDelete={false}
          canExport={false}
          canEdit={false}
          columns={columns}
          endpoint={API_ROUTES.ADMIN.POST_CLIENT_REQUEST_LOG_LIST}
          getRowId={(row) => row.id}
        />
      </Paper>
    </Page>
  );
}
