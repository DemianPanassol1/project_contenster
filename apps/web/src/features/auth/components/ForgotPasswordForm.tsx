'use client';

import type { ForgotPasswordRequest } from '@contenster/shared';
import { Link as MuiLink, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { ElementType } from 'react';

import { useValidationRules } from '@/hooks';
import { Link } from '@/i18n/navigation';
import { Button, FormInput, FormWrapper } from '@/shared';

import {
  FORGOT_PASSWORD_DEFAULT_VALUES,
  FORGOT_PASSWORD_FORM_ID,
} from '../constants/auth.constants';

interface ForgotPasswordFormProps {
  isPending: boolean;
  onSubmit: (values: ForgotPasswordRequest) => Promise<boolean>;
}

export function ForgotPasswordForm({ isPending, onSubmit }: ForgotPasswordFormProps) {
  const t = useTranslations('auth.password_recovery');
  const { createValidationRules } = useValidationRules<ForgotPasswordRequest>();

  return (
    <FormWrapper<ForgotPasswordRequest>
      fields={FORGOT_PASSWORD_DEFAULT_VALUES}
      id={FORGOT_PASSWORD_FORM_ID}
      showPaper={false}
      onSubmit={onSubmit}
    >
      <Stack spacing={2}>
        <FormInput<ForgotPasswordRequest>
          autoComplete="email"
          disabled={isPending}
          label={t('email')}
          name="email"
          rules={createValidationRules('required|email')}
          type="email"
        />
        <Button
          disabled={isPending}
          form={FORGOT_PASSWORD_FORM_ID}
          label={t('submit')}
          type="submit"
        />
        <Typography sx={{ textAlign: 'center' }}>
          <MuiLink
            component={Link as ElementType}
            href="/auth/login"
            underline="hover"
            variant="body2"
          >
            {t('back_to_login')}
          </MuiLink>
        </Typography>
      </Stack>
    </FormWrapper>
  );
}
