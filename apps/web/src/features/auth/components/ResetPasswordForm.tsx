'use client';

import { Stack } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useValidationRules } from '@/hooks';
import { Button, FormPasswordInput, FormWrapper } from '@/shared';

import { RESET_PASSWORD_DEFAULT_VALUES, RESET_PASSWORD_FORM_ID } from '../constants/auth.constants';
import type { ResetPasswordFormValues } from '../types/reset-password.types';

interface ResetPasswordFormProps {
  isPending: boolean;
  onSubmit: (values: ResetPasswordFormValues) => Promise<boolean>;
}

export function ResetPasswordForm({ isPending, onSubmit }: ResetPasswordFormProps) {
  const t = useTranslations('auth.password_reset');
  const { createValidationRules } = useValidationRules<ResetPasswordFormValues>();

  return (
    <FormWrapper<ResetPasswordFormValues>
      fields={RESET_PASSWORD_DEFAULT_VALUES}
      id={RESET_PASSWORD_FORM_ID}
      showPaper={false}
      onSubmit={onSubmit}
    >
      <Stack spacing={2}>
        <FormPasswordInput<ResetPasswordFormValues>
          autoComplete="new-password"
          disabled={isPending}
          label={t('password')}
          name="password"
          rules={createValidationRules('required|min_length[8]|max_length[100]')}
        />
        <FormPasswordInput<ResetPasswordFormValues>
          autoComplete="new-password"
          disabled={isPending}
          label={t('confirm_password')}
          name="confirmPassword"
          rules={{
            required: t('confirm_password_required'),
            validate: (value, values) => value === values.password || t('passwords_must_match'),
          }}
        />
        <Button
          disabled={isPending}
          form={RESET_PASSWORD_FORM_ID}
          label={t('submit')}
          type="submit"
        />
      </Stack>
    </FormWrapper>
  );
}
