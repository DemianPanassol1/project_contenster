'use client';

import type { SessionLanguage } from '@contenster/shared';
import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { useValidationRules } from '@/hooks';
import { API_ROUTES } from '@/routes';
import { useOptions } from '@/services/hooks';
import { Chip, CrudTable, type DataTableColumn, FormSwitch, TranslationsFields } from '@/shared';
import { generateID } from '@/utils';

import type { ProfileFormValues, ProfilePermissionFormItem } from '../utils/profile.utils';

import { ProfilePermissionForm } from './ProfilePermissionForm';

const OPTIONS_BODY = {
  isOptional: false,
  pagination: { filters: [], page: 1, perPage: 1000, sort: [] },
} as const;
const MAX_VISIBLE_ACTIONS = 5;

interface ProfileFormProps {
  languages: SessionLanguage[];
}

const getPermissionRowId = (permission: ProfilePermissionFormItem): string => permission.rowId;

export function ProfileForm({ languages }: ProfileFormProps) {
  const t = useTranslations('protected.profiles');
  const { createValidationRules } = useValidationRules<ProfileFormValues>();
  const { control } = useFormContext<ProfileFormValues>();

  const isAdmin = useWatch({ control, name: 'isAdmin' }) === true;
  const permissions = useWatch({ control, name: 'permissions' }) ?? [];

  const { options: functionalityOptions } = useOptions({
    optionsBody: OPTIONS_BODY,
    optionsEndpoint: API_ROUTES.ADMIN.POST_PROFILE_FUNCTIONALITY_OPTIONS,
    optionsMethod: 'POST',
    revalidateOptions: true,
  });
  const { options: actionOptions } = useOptions({
    optionsBody: OPTIONS_BODY,
    optionsEndpoint: API_ROUTES.ADMIN.POST_PROFILE_ACTION_OPTIONS,
    optionsMethod: 'POST',
    revalidateOptions: true,
  });

  const permissionColumns = useMemo<DataTableColumn<ProfilePermissionFormItem>[]>(
    () => [
      {
        field: 'functionalityId',
        name: t('functionality'),
        renderCell: ({ value }) =>
          functionalityOptions.find((option) => option.value === value)?.label ?? '-',
        type: 'custom',
      },
      {
        field: 'actionIds',
        name: t('action'),
        renderCell: ({ row }) => {
          const actionLabels = row.actionIds
            .map((actionId) => actionOptions.find((option) => option.value === actionId)?.label)
            .filter((label): label is string => Boolean(label));
          const visibleActionLabels = actionLabels.slice(0, MAX_VISIBLE_ACTIONS);
          const hiddenActionsCount = actionLabels.length - visibleActionLabels.length;

          return hiddenActionsCount
            ? `${visibleActionLabels.join(', ')} + ${t('additional_actions', {
                count: String(hiddenActionsCount),
              })}`
            : visibleActionLabels.join(', ') || '-';
        },
        type: 'custom',
      },
    ],
    [actionOptions, functionalityOptions, t],
  );

  const usedFunctionalityIds = new Set(
    permissions
      .map((permission) => permission.functionalityId)
      .filter((functionalityId): functionalityId is number => functionalityId !== null),
  );

  const getAvailableFunctionalityOptions = (currentFunctionalityId: number | null) =>
    functionalityOptions.filter(
      (option) =>
        typeof option.value !== 'number' ||
        option.value === currentFunctionalityId ||
        !usedFunctionalityIds.has(option.value),
    );

  return (
    <Box
      sx={{
        display: 'grid',
        gap: '1.5rem 2rem',
        gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
      }}
    >
      <TranslationsFields<ProfileFormValues>
        label={t('name')}
        languages={languages}
        name="translations"
        rules={createValidationRules('required|max_length[150]')}
        textProperty="name"
      />

      <Box sx={{ alignSelf: 'center', display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        {isAdmin && <Chip color="info" label={t('administrator')} />}
        <FormSwitch<ProfileFormValues> disabled={isAdmin} label={t('is_active')} name="isActive" />
      </Box>

      <Box sx={{ gridColumn: { md: '1 / -1' } }}>
        <TranslationsFields<ProfileFormValues>
          label={t('description')}
          languages={languages}
          name="translations"
          textProperty="description"
          type="textarea"
        />
      </Box>

      <Box sx={{ gridColumn: { md: '1 / -1' } }}>
        <CrudTable<ProfileFormValues, ProfilePermissionFormItem>
          columns={permissionColumns}
          createLabel={t('add_permission')}
          defaultRow={() => ({
            actionIds: [],
            functionalityId: null,
            permissionIdsByActionId: {},
            rowId: generateID(),
          })}
          deleteConfirmation={{
            cancelLabel: t('cancel'),
            confirmLabel: t('delete'),
            message: t('delete_permission_message'),
            title: t('delete_permission_title'),
          }}
          deleteLabel={t('delete')}
          editLabel={t('edit_permission')}
          getRowId={getPermissionRowId}
          modal={{
            createTitle: t('add_permission'),
            editTitle: t('edit_permission'),
            maxWidth: 'sm',
          }}
          name="permissions"
          renderForm={({ row }) => (
            <ProfilePermissionForm
              actionOptions={actionOptions}
              functionalityOptions={getAvailableFunctionalityOptions(row?.functionalityId ?? null)}
            />
          )}
          showCreateAction={!isAdmin}
          showDeleteAction={!isAdmin}
          showEditAction={!isAdmin}
        />
      </Box>
    </Box>
  );
}
