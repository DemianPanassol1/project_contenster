'use client';

import type { ResetPasswordRequest } from '@contenster/shared';
import { Alert, Stack } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { useToast, useWebResponseErrorToast } from '@/hooks';
import { useRouter } from '@/i18n/navigation';
import { AuthCard } from '@/layouts';
import { resetPassword } from '@/services/actions';
import { Button } from '@/shared';

import { ResetPasswordForm } from '../components/ResetPasswordForm';
import type { ResetPasswordFormValues } from '../types/reset-password.types';
import { isDecodablePasswordResetToken } from '../utils/auth.utils';

interface ResetPasswordViewProps {
  token: string | null;
}

export function ResetPasswordView({ token }: ResetPasswordViewProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('auth.password_reset');
  const { errorMessage } = useToast();
  const showErrors = useWebResponseErrorToast();
  const [isPending, setIsPending] = useState(false);
  const [isInvalidToken, setIsInvalidToken] = useState(
    !token || !isDecodablePasswordResetToken(token),
  );
  const [isReset, setIsReset] = useState(false);

  const submit = async (values: ResetPasswordFormValues): Promise<boolean> => {
    if (!token) {
      setIsInvalidToken(true);

      return false;
    }

    const request: ResetPasswordRequest = {
      password: values.password,
      token,
    };
    const response = await resetPassword(request, locale);

    if (response.success) {
      setIsReset(true);

      return true;
    }

    if (response.errors.some((error) => error.code === 'invalid_reset_token')) {
      setIsInvalidToken(true);

      return false;
    }

    showErrors(response);

    return false;
  };

  const handleSubmit = async (values: ResetPasswordFormValues): Promise<boolean> => {
    setIsPending(true);

    try {
      return await submit(values);
    } catch {
      errorMessage(t('unexpected_error'));

      return false;
    } finally {
      setIsPending(false);
    }
  };

  if (isInvalidToken) {
    return (
      <AuthCard title={t('invalid_title')}>
        <Stack spacing={2.5}>
          <Alert severity="warning" variant="outlined">
            {t('invalid_token')}
          </Alert>
          <Button
            label={t('request_new_link')}
            onClick={() => router.push('/auth/forgot-password')}
          />
          <Button
            label={t('back_to_login')}
            onClick={() => router.push('/auth/login')}
            variant="text"
          />
        </Stack>
      </AuthCard>
    );
  }

  if (isReset) {
    return (
      <AuthCard title={t('success_title')}>
        <Stack spacing={2.5}>
          <Alert severity="success" variant="outlined">
            {t('success')}
          </Alert>
          <Button label={t('go_to_login')} onClick={() => router.push('/auth/login')} />
        </Stack>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t('title')}>
      <ResetPasswordForm isPending={isPending} onSubmit={handleSubmit} />
    </AuthCard>
  );
}
