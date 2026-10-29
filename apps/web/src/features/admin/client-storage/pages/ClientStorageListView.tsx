'use client';

import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import {
  ActionType,
  type ClientStorageFileListItem,
  type StorageConfigurationDetail,
  type StorageConfigurationListItem,
  type StorageFileTypeRuleListItem,
} from '@contenster/shared';
import { useGlobalContext, useModalContext } from '@/core/providers';
import { hasPermissionAction } from '@/features/shared/navigation';
import type { AdminFeatureViewProps } from '@/registry/admin';
import { API_ROUTES } from '@/routes';
import { Button, DataTable, FormWrapper, Icon, Page, useDataTableRemote } from '@/shared';

import { ClientStorageSection } from '../components/ClientStorageSection';
import { StorageConfigurationForm } from '../components/StorageConfigurationForm';
import { StorageFileTypeRuleForm } from '../components/StorageFileTypeRuleForm';
import { useClientStorageFileColumns } from '../hooks/useClientStorageFileColumns';
import { useStorageConfigurationColumns } from '../hooks/useStorageConfigurationColumns';
import { useStorageConfigurationOptions } from '../hooks/useStorageConfigurationOptions';
import { useStorageFileTypeRuleColumns } from '../hooks/useStorageFileTypeRuleColumns';
import type {
  StorageConfigurationFormValues,
  StorageFileTypeRuleFormValues,
} from '../types/client-storage.types';
import {
  getStorageConfigurationDefaultValues,
  getStorageFileTypeRuleDefaultValues,
  mapStorageConfigurationContent,
  mapStorageConfigurationPayload,
  openStorageFileUrl,
} from '../utils/client-storage.utils';

const STORAGE_CONFIGURATION_FORM_ID = 'storage-configuration-form';
const STORAGE_FILE_TYPE_RULE_FORM_ID = 'storage-file-type-rule-form';

export function ClientStorageListView({ presentation }: AdminFeatureViewProps) {
  const t = useTranslations('protected.client_storage');
  const { apiRequest } = useGlobalContext();
  const { closeModal, openModal } = useModalContext();
  const configurationColumns = useStorageConfigurationColumns();
  const ruleColumns = useStorageFileTypeRuleColumns();
  const fileColumns = useClientStorageFileColumns();

  const configurationTable = useDataTableRemote<StorageConfigurationListItem>({
    columns: configurationColumns,
    endpoint: API_ROUTES.ADMIN.POST_CLIENT_STORAGE_CONFIGURATION_LIST,
  });
  const ruleTable = useDataTableRemote<StorageFileTypeRuleListItem>({
    columns: ruleColumns,
    endpoint: API_ROUTES.ADMIN.POST_CLIENT_STORAGE_RULE_LIST,
  });
  const fileTable = useDataTableRemote<ClientStorageFileListItem>({
    columns: fileColumns,
    endpoint: API_ROUTES.ADMIN.POST_CLIENT_STORAGE_FILE_LIST,
  });

  const configurationOptions = useStorageConfigurationOptions();
  const canCreate = hasPermissionAction(presentation.actions, ActionType.create);
  const canDelete = hasPermissionAction(presentation.actions, ActionType.delete);
  const canEdit = hasPermissionAction(presentation.actions, ActionType.edit);

  const openConfigurationModal = (configurationId: number | null) => {
    const isEditing = configurationId !== null;
    let modalId = '';

    modalId = openModal({
      actions: [
        { closeOnClick: true, label: t('cancel'), variant: 'text' },
        {
          form: STORAGE_CONFIGURATION_FORM_ID,
          label: t('save'),
          type: 'submit',
          variant: 'contained',
        },
      ],
      content: (
        <FormWrapper<StorageConfigurationFormValues>
          contentUrl={
            isEditing
              ? API_ROUTES.ADMIN.GET_CLIENT_STORAGE_CONFIGURATION(configurationId)
              : undefined
          }
          fields={getStorageConfigurationDefaultValues()}
          id={STORAGE_CONFIGURATION_FORM_ID}
          mapContent={(content) =>
            mapStorageConfigurationContent(content as StorageConfigurationDetail)
          }
          onSubmit={async (values) =>
            (
              await apiRequest<StorageConfigurationListItem>({
                body: mapStorageConfigurationPayload(values),
                endpoint: API_ROUTES.ADMIN.POST_CLIENT_STORAGE_CONFIGURATION,
                method: 'POST',
                onSuccess: async () => {
                  await Promise.all([
                    configurationTable.refresh?.(),
                    configurationOptions.refresh(),
                  ]);
                  closeModal(modalId);
                },
              })
            ).success
          }
          showPaper={false}
        >
          <StorageConfigurationForm />
        </FormWrapper>
      ),
      maxWidth: 'sm',
      title: isEditing ? t('edit_configuration') : t('create_configuration'),
    });
  };

  const openRuleModal = (rule: StorageFileTypeRuleListItem | null) => {
    const isEditing = rule !== null;
    let modalId = '';

    modalId = openModal({
      actions: [
        { closeOnClick: true, label: t('cancel'), variant: 'text' },
        {
          form: STORAGE_FILE_TYPE_RULE_FORM_ID,
          label: t('save'),
          type: 'submit',
          variant: 'contained',
        },
      ],
      content: (
        <FormWrapper<StorageFileTypeRuleFormValues>
          fields={
            rule
              ? {
                  fileType: rule.fileType,
                  id: rule.id,
                  isActive: rule.isActive,
                  storageConfigurationId: rule.storageConfigurationId,
                }
              : getStorageFileTypeRuleDefaultValues()
          }
          id={STORAGE_FILE_TYPE_RULE_FORM_ID}
          onSubmit={async (values) =>
            (
              await apiRequest<StorageFileTypeRuleListItem>({
                body: values,
                endpoint: API_ROUTES.ADMIN.POST_CLIENT_STORAGE_RULE,
                method: 'POST',
                onSuccess: async () => {
                  await ruleTable.refresh?.();
                  closeModal(modalId);
                },
              })
            ).success
          }
          showPaper={false}
        >
          <StorageFileTypeRuleForm configurationOptions={configurationOptions.options} />
        </FormWrapper>
      ),
      maxWidth: 'sm',
      title: isEditing ? t('edit_rule') : t('create_rule'),
    });
  };

  return (
    <Page
      description={presentation.description ?? undefined}
      functionality={presentation.functionalityName}
      module={presentation.moduleName}
    >
      <Box sx={{ display: 'grid', gap: 3 }}>
        <ClientStorageSection
          description={t('configurations_description')}
          title={t('configurations_title')}
        >
          <DataTable<StorageConfigurationListItem>
            actions={
              canEdit
                ? [
                    {
                      icon: 'square-pen',
                      label: t('edit'),
                      onClick: (row) => openConfigurationModal(row.id),
                    },
                  ]
                : []
            }
            bulkDeleteEndpoint={API_ROUTES.ADMIN.POST_CLIENT_STORAGE_CONFIGURATION_DELETE}
            canDelete={canDelete}
            canEdit={false}
            canExport={false}
            columns={configurationColumns}
            deleteConfirmation={{
              cancelLabel: t('cancel'),
              confirmLabel: t('delete'),
              manyConfirmLabel: t('delete'),
              message: t('delete_configuration_message'),
              title: t('delete_configuration'),
            }}
            getRowId={(row) => row.id}
            loading={configurationTable.loading}
            meta={configurationTable.meta}
            onDeleteSuccess={() => void configurationTable.refresh?.()}
            onFiltersChange={configurationTable.setFilters}
            onPageChange={configurationTable.setPage}
            onPerPageChange={configurationTable.setPerPage}
            onRefresh={configurationTable.refresh}
            onSortChange={configurationTable.setSortBy}
            page={configurationTable.page}
            perPage={configurationTable.perPage}
            primaryAction={
              canCreate ? (
                <Button
                  icon="plus"
                  iconPosition="start"
                  label={t('create_register')}
                  onClick={() => openConfigurationModal(null)}
                />
              ) : undefined
            }
            rows={configurationTable.rows}
            showRowDeleteAction={canDelete}
            sortBy={configurationTable.sortBy}
          />
        </ClientStorageSection>

        <ClientStorageSection description={t('rules_description')} title={t('rules_title')}>
          <DataTable<StorageFileTypeRuleListItem>
            actions={
              canEdit
                ? [
                    {
                      icon: 'square-pen',
                      label: t('edit'),
                      onClick: (row) => openRuleModal(row),
                    },
                  ]
                : []
            }
            bulkDeleteEndpoint={API_ROUTES.ADMIN.POST_CLIENT_STORAGE_RULE_DELETE}
            canDelete={canDelete}
            canEdit={false}
            canExport={false}
            columns={ruleColumns}
            deleteConfirmation={{
              cancelLabel: t('cancel'),
              confirmLabel: t('delete'),
              manyConfirmLabel: t('delete'),
              message: t('delete_rule_message'),
              title: t('delete_rule'),
            }}
            getRowId={(row) => row.id}
            loading={ruleTable.loading}
            meta={ruleTable.meta}
            onDeleteSuccess={() => void ruleTable.refresh?.()}
            onFiltersChange={ruleTable.setFilters}
            onPageChange={ruleTable.setPage}
            onPerPageChange={ruleTable.setPerPage}
            onRefresh={ruleTable.refresh}
            onSortChange={ruleTable.setSortBy}
            page={ruleTable.page}
            perPage={ruleTable.perPage}
            primaryAction={
              canCreate ? (
                <Button
                  disabled={
                    configurationOptions.isLoading || configurationOptions.options.length === 0
                  }
                  icon="plus"
                  iconPosition="start"
                  label={t('create_register')}
                  onClick={() => openRuleModal(null)}
                />
              ) : undefined
            }
            rows={ruleTable.rows}
            showRowDeleteAction={canDelete}
            sortBy={ruleTable.sortBy}
          />
        </ClientStorageSection>

        <ClientStorageSection description={t('files_description')} title={t('files_title')}>
          <DataTable<ClientStorageFileListItem>
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
            columns={fileColumns}
            emptyState={
              <Box
                sx={{
                  alignItems: 'center',
                  color: 'text.secondary',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.75,
                  justifyContent: 'center',
                  py: 6,
                }}
              >
                <Icon name="scan-search" size={24} />
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                  {t('no_files_title')}
                </Typography>
                <Typography sx={{ fontSize: 12.5 }}>{t('no_files_description')}</Typography>
              </Box>
            }
            getRowId={(row) => row.id}
            loading={fileTable.loading}
            meta={fileTable.meta}
            onFiltersChange={fileTable.setFilters}
            onPageChange={fileTable.setPage}
            onPerPageChange={fileTable.setPerPage}
            onRefresh={fileTable.refresh}
            onSortChange={fileTable.setSortBy}
            page={fileTable.page}
            perPage={fileTable.perPage}
            rows={fileTable.rows}
            sortBy={fileTable.sortBy}
          />
        </ClientStorageSection>
      </Box>
    </Page>
  );
}
