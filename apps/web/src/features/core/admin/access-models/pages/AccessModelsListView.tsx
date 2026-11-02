'use client';

import type { AccessModelListItem } from '@contenster/shared';
import { Paper } from '@mui/material';
import { useTranslations } from 'next-intl';

import { crudUpdatePath } from '@/features/shared/navigation';
import { useRouter } from '@/i18n/navigation';
import type { AdminFeatureViewProps } from '@/registry/admin';
import { API_ROUTES } from '@/routes';
import { DataTable, type DataTableAction, Page } from '@/shared';

export function AccessModelsListView({ functionalitySlug, presentation }: AdminFeatureViewProps) {
  const t = useTranslations('protected.access_models');
  const router = useRouter();
  const actions: DataTableAction<AccessModelListItem>[] = [
    {
      label: t('apply'),
      icon: 'rocket',
      onClick: (model) => router.push(crudUpdatePath(functionalitySlug, model.id)),
    },
  ];
  return (
    <Page
      module={presentation.moduleName}
      functionality={presentation.functionalityName}
      description={presentation.description ?? undefined}
    >
      <Paper elevation={1} square={false} sx={{ px: 2, py: 3 }}>
        <DataTable<AccessModelListItem>
          endpoint={API_ROUTES.ADMIN.POST_ACCESS_MODEL_LIST}
          columns={[
            { field: 'name', name: t('name') },
            { field: 'description', name: t('description') },
            { field: 'isActive', name: t('active') },
          ]}
          getRowId={(row) => row.id}
          actions={actions}
        />
      </Paper>
    </Page>
  );
}
