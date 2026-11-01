'use client';

import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { useValidationRules } from '@/hooks';
import type { SelectOption } from '@/services/hooks';
import { FormSelect } from '@/shared';

import type { ProfilePermissionFormItem } from '../utils/profile.utils';

interface ProfilePermissionFormProps {
  actionOptions: SelectOption[];
  functionalityOptions: SelectOption[];
}

export function ProfilePermissionForm({
  actionOptions,
  functionalityOptions,
}: ProfilePermissionFormProps) {
  const t = useTranslations('protected.profiles');
  const { createValidationRules } = useValidationRules<ProfilePermissionFormItem>();
  const { setValue } = useFormContext<ProfilePermissionFormItem>();

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <FormSelect<ProfilePermissionFormItem>
        label={t('functionality')}
        name="functionalityId"
        onValueChange={() => {
          setValue('actionIds', [], { shouldDirty: true, shouldTouch: true });
          setValue('permissionIdsByActionId', {}, { shouldDirty: true, shouldTouch: true });
        }}
        options={functionalityOptions}
        rules={createValidationRules('required|greater_than[0]')}
      />
      <FormSelect<ProfilePermissionFormItem>
        multiple
        label={t('action')}
        name="actionIds"
        options={actionOptions}
        rules={createValidationRules('required')}
      />
    </Box>
  );
}
