'use client';

import type { SaveUserRequest } from '@contenster/shared';
import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useValidationRules } from '@/hooks';
import { API_ROUTES } from '@/routes';
import {
  FormImageUpload,
  FormInput,
  FormMaskedInput,
  FormPasswordInput,
  FormSelect,
  FormSwitch,
} from '@/shared';

const PROFILE_OPTIONS_BODY = {
  isOptional: false,
  pagination: { filters: [], page: 1, perPage: 1000, sort: [] },
} as const;

interface UserFormProps {
  isCreateMode: boolean;
}

export function UserForm({ isCreateMode }: UserFormProps) {
  const t = useTranslations('protected.users');
  const { createValidationRules } = useValidationRules<SaveUserRequest>();

  return (
    <Box
      sx={{
        display: 'grid',
        gap: '1.5rem 2rem',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
      }}
    >
      <FormInput<SaveUserRequest>
        label={t('name')}
        name="name"
        rules={createValidationRules('required|max_length[255]')}
      />
      <FormInput<SaveUserRequest>
        label={t('username')}
        name="username"
        rules={createValidationRules('required|max_length[75]')}
      />
      <FormInput<SaveUserRequest>
        label={t('email')}
        name="email"
        rules={createValidationRules('required|email|max_length[255]')}
        type="email"
      />
      <FormMaskedInput<SaveUserRequest>
        label={t('primary_phone')}
        maskType="phone"
        name="primaryPhone"
        phoneCountry="BR"
        phonePrefixes={{ BR: '55', ES: '34', US: '1' }}
        rules={createValidationRules('required|max_length[30]')}
      />
      <FormMaskedInput<SaveUserRequest>
        label={t('secondary_phone')}
        maskType="phone"
        name="secondaryPhone"
        phoneCountry="BR"
        phonePrefixes={{ BR: '55', ES: '34', US: '1' }}
        rules={createValidationRules('max_length[30]')}
      />
      <FormSelect<SaveUserRequest>
        label={t('profile')}
        name="profileId"
        optionsBody={PROFILE_OPTIONS_BODY}
        optionsEndpoint={API_ROUTES.ADMIN.POST_USER_PROFILE_OPTIONS}
        optionsMethod="POST"
        rules={createValidationRules('required|greater_than[0]')}
      />
      {isCreateMode && (
        <FormPasswordInput<SaveUserRequest>
          label={t('password')}
          name="password"
          rules={createValidationRules('required|min_length[5]|max_length[255]')}
        />
      )}
      <Box sx={{ gridColumn: { md: '1 / -1' } }}>
        <FormImageUpload<SaveUserRequest> label={t('image')} name="imageId" />
      </Box>
      <FormSwitch<SaveUserRequest> label={t('is_active')} name="isActive" />
      <FormSwitch<SaveUserRequest> label={t('is_blocked')} name="isBlocked" />
    </Box>
  );
}
