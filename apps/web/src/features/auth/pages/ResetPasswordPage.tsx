'use client';

import type { ResetPasswordRequest } from '@contenster/shared';
import { Alert, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import { useRouter } from '@/i18n/navigation';
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
  const t = useTranslations('auth.password_reset');
  const [isPending, startTransition] = useTransition();
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
    const response = await resetPassword(request);

    if (response.success) {
      setIsReset(true);

      return true;
    }

    setIsInvalidToken(true);

    return false;
  };

  const handleSubmit = (values: ResetPasswordFormValues): Promise<boolean> =>
    new Promise((resolve) => {
      startTransition(() => {
        void submit(values).then(resolve);
      });
    });

  if (isInvalidToken) {
    return (
      <Stack spacing={2.5}>
        <Typography component="h2" variant="h5">
          {t('invalid_title')}
        </Typography>
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
    );
  }

  if (isReset) {
    return (
      <Stack spacing={2.5}>
        <Typography component="h2" variant="h5">
          {t('success_title')}
        </Typography>
        <Alert severity="success" variant="outlined">
          {t('success')}
        </Alert>
        <Button label={t('go_to_login')} onClick={() => router.push('/auth/login')} />
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography component="h2" variant="h5">
        {t('title')}
      </Typography>
      <ResetPasswordForm isPending={isPending} onSubmit={handleSubmit} />
    </Stack>
  );
}
