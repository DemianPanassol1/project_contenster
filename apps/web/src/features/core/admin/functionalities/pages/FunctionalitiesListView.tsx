'use client';

import { Paper } from '@mui/material';
import { useTranslations } from 'next-intl';

import { ActionType, type FunctionalityListItem } from '@contenster/shared';
import { crudCreatePath, crudUpdatePath, hasPermissionAction } from '@/features/shared/navigation';
import { useRouter } from '@/i18n/navigation';
import type { AdminFeatureViewProps } from '@/registry/admin';
import { API_ROUTES } from '@/routes';
import { Button, DataTable, Page } from '@/shared';

import { useFunctionalityColumns } from '../hooks/useFunctionalityColumns';
export function FunctionalitiesListView({
  functionalitySlug,
  presentation,
}: AdminFeatureViewProps) {
  const router = useRouter();
  const t = useTranslations('protected.functionalities');
  const columns = useFunctionalityColumns();
  const canCreate = hasPermissionAction(presentation.actions, ActionType.create);
  const canDelete = hasPermissionAction(presentation.actions, ActionType.delete);
  const canEdit = hasPermissionAction(presentation.actions, ActionType.edit);
  const canExport = hasPermissionAction(presentation.actions, ActionType.export);

  return (
    <Page
      actions={
        canCreate ? (
          <Button
            icon="plus"
            iconPosition="start"
            label={t('create_register')}
            onClick={() => router.push(crudCreatePath(functionalitySlug))}
          />
        ) : undefined
      }
      description={presentation.description ?? undefined}
      functionality={presentation.functionalityName}
      module={presentation.moduleName}
    >
      <Paper elevation={1} square={false} sx={{ px: 2, py: 3 }}>
        <DataTable<FunctionalityListItem>
          bulkDeleteEndpoint={API_ROUTES.ADMIN.DELETE_FUNCTIONALITIES}
          canDelete={canDelete}
          canEdit={canEdit}
          canExport={canExport}
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
          endpoint={API_ROUTES.ADMIN.POST_FUNCTIONALITY_LIST}
          getRowEditPath={(_row, id) => crudUpdatePath(functionalitySlug, id)}
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
