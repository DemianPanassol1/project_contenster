'use client';

import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import { type AppOption, fileTypeDictionary, storageProviderDictionary } from '@contenster/shared';
import { portalFontSize } from '@/core/theme';
import { StorageConfigurationForm } from '@/features/core/admin/client-storage/components/StorageConfigurationForm';
import { useValidationRules } from '@/hooks';
import { CrudTable, type DataTableColumn, FormSelect, FormSwitch } from '@/shared';

import type {
  SystemAdminClientFormValues,
  SystemAdminStorageConfigurationFormValues,
  SystemAdminStorageRuleFormValues,
} from '../types/system-admin-client-form.types';
import {
  getSystemAdminStorageConfigurationDefaultValues,
  getSystemAdminStorageRuleDefaultValues,
} from '../utils/system-admin-client.utils';

interface StorageRuleFormProps {
  configurationOptions: AppOption<string>[];
}

function StorageRuleForm({ configurationOptions }: StorageRuleFormProps) {
  const t = useTranslations('protected.client_storage');
  const tEnum = useTranslations();
  const { createValidationRules } = useValidationRules<SystemAdminStorageRuleFormValues>();

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <FormSelect<SystemAdminStorageRuleFormValues>
        label={t('fields.file_type')}
        name="fileType"
        options={Object.entries(fileTypeDictionary).map(([value, translationKey]) => ({
          label: tEnum(translationKey),
          value,
        }))}
        rules={createValidationRules('required')}
      />
      <FormSelect<SystemAdminStorageRuleFormValues>
        label={t('fields.storage_configuration')}
        name="storageConfigurationKey"
        options={configurationOptions}
        rules={createValidationRules('required')}
      />
      <FormSwitch<SystemAdminStorageRuleFormValues> label={t('fields.is_active')} name="isActive" />
    </Box>
  );
}

export function SystemAdminClientStorageEditor() {
  const t = useTranslations('protected.client_storage');
  const tClients = useTranslations('protected.system_admin.clients');
  const tEnum = useTranslations();
  const watchedConfigurations = useWatch<SystemAdminClientFormValues>({
    name: 'storageConfigurations',
  }) as SystemAdminStorageConfigurationFormValues[] | undefined;
  const configurations = useMemo(() => watchedConfigurations ?? [], [watchedConfigurations]);
  const configurationOptions = configurations.map((configuration) => ({
    disabled: null,
    label: configuration.name || t('create_configuration'),
    metadata: null,
    value: configuration.key,
  }));
  const configurationNameByKey = useMemo(
    () => new Map(configurations.map((configuration) => [configuration.key, configuration.name])),
    [configurations],
  );

  const configurationColumns = useMemo<
    DataTableColumn<SystemAdminStorageConfigurationFormValues>[]
  >(
    () => [
      { field: 'name', name: t('fields.name'), type: 'text' },
      {
        field: 'provider',
        name: t('fields.provider'),
        renderCell: ({ value }) => tEnum(storageProviderDictionary[value as never]),
        type: 'custom',
      },
      {
        field: 'isActive',
        name: t('fields.is_active'),
        renderCell: ({ value }) => (value ? tClients('active') : tClients('inactive')),
        type: 'custom',
      },
    ],
    [t, tClients, tEnum],
  );
  const ruleColumns = useMemo<DataTableColumn<SystemAdminStorageRuleFormValues>[]>(
    () => [
      {
        field: 'fileType',
        name: t('fields.file_type'),
        renderCell: ({ value }) => tEnum(fileTypeDictionary[value as never]),
        type: 'custom',
      },
      {
        field: 'storageConfigurationKey',
        name: t('fields.storage_configuration'),
        renderCell: ({ value }) => configurationNameByKey.get(String(value)) ?? '-',
        type: 'custom',
      },
      {
        field: 'isActive',
        name: t('fields.is_active'),
        renderCell: ({ value }) => (value ? tClients('active') : tClients('inactive')),
        type: 'custom',
      },
    ],
    [configurationNameByKey, t, tClients, tEnum],
  );

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box>
        <Typography sx={{ fontSize: portalFontSize(14), fontWeight: 700 }}>
          {t('configurations_title')}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: portalFontSize(12.5), mb: 1.5 }}>
          {t('configurations_description')}
        </Typography>
        <CrudTable<SystemAdminClientFormValues, SystemAdminStorageConfigurationFormValues>
          columns={configurationColumns}
          createLabel={t('create_configuration')}
          defaultRow={getSystemAdminStorageConfigurationDefaultValues}
          deleteConfirmation={{
            confirmLabel: t('delete'),
            message: t('delete_configuration_message'),
            title: t('delete_configuration'),
          }}
          deleteLabel={t('delete')}
          editLabel={t('edit')}
          getRowId={(row) => row.key}
          modal={{ createTitle: t('create_configuration'), editTitle: t('edit_configuration') }}
          name="storageConfigurations"
          renderForm={() => <StorageConfigurationForm showTestConnection={false} />}
        />
      </Box>

      <Box>
        <Typography sx={{ fontSize: portalFontSize(14), fontWeight: 700 }}>
          {t('rules_title')}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: portalFontSize(12.5), mb: 1.5 }}>
          {t('rules_description')}
        </Typography>
        <CrudTable<SystemAdminClientFormValues, SystemAdminStorageRuleFormValues>
          columns={ruleColumns}
          createLabel={t('create_rule')}
          defaultRow={getSystemAdminStorageRuleDefaultValues}
          deleteConfirmation={{
            confirmLabel: t('delete'),
            message: t('delete_rule_message'),
            title: t('delete_rule'),
          }}
          deleteLabel={t('delete')}
          editLabel={t('edit')}
          getRowId={(row) => row.rowId}
          modal={{ createTitle: t('create_rule'), editTitle: t('edit_rule') }}
          name="storageRules"
          renderForm={() => <StorageRuleForm configurationOptions={configurationOptions} />}
        />
      </Box>
    </Box>
  );
}
