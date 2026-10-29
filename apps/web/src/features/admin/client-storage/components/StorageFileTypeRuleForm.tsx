'use client';

import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';

import { FileType } from '@contenster/shared';
import { useValidationRules } from '@/hooks';
import type { SelectOption } from '@/services/hooks';
import { FormSelect, FormSwitch } from '@/shared';

import type { StorageFileTypeRuleFormValues } from '../types/client-storage.types';

interface StorageFileTypeRuleFormProps {
  configurationOptions: SelectOption[];
}

export function StorageFileTypeRuleForm({ configurationOptions }: StorageFileTypeRuleFormProps) {
  const t = useTranslations('protected.client_storage');
  const { createValidationRules } = useValidationRules<StorageFileTypeRuleFormValues>();
  const fileTypeOptions: SelectOption[] = [
    { label: t('file_types.image'), value: FileType.image },
    { label: t('file_types.video'), value: FileType.video },
    { label: t('file_types.icon'), value: FileType.icon },
    { label: t('file_types.file'), value: FileType.file },
  ];

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <FormSelect<StorageFileTypeRuleFormValues>
        label={t('fields.file_type')}
        name="fileType"
        options={fileTypeOptions}
        rules={createValidationRules('required')}
      />
      <FormSelect<StorageFileTypeRuleFormValues>
        label={t('fields.storage_configuration')}
        name="storageConfigurationId"
        options={configurationOptions}
        rules={createValidationRules('required')}
      />
      <FormSwitch<StorageFileTypeRuleFormValues> label={t('fields.is_active')} name="isActive" />
    </Box>
  );
}
