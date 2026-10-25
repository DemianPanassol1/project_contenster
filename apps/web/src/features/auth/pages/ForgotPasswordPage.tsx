'use client';

import type { ForgotPasswordRequest } from '@contenster/shared';
import { Alert, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import { useToast } from '@/hooks';
import { useRouter } from '@/i18n/navigation';
import { forgotPassword } from '@/services/actions';
import { Button } from '@/shared';

import { ForgotPasswordForm } from '../components/ForgotPasswordForm';

export function ForgotPasswordView() {
  const router = useRouter();
  const t = useTranslations('auth.password_recovery');
  const { errorMessage } = useToast();
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const submit = async (values: ForgotPasswordRequest): Promise<boolean> => {
    const response = await forgotPassword(values);

    if (response.success) {
      setSent(true);

      return true;
    }

    response.errors.forEach((error) => errorMessage(error.message));

    return false;
  };

  const handleSubmit = (values: ForgotPasswordRequest): Promise<boolean> =>
    new Promise((resolve) => {
      startTransition(() => {
        void submit(values).then(resolve);
      });
    });

  if (sent) {
    return (
      <Stack spacing={3}>
        <Typography component="h2" variant="h5">
          {t('success_title')}
        </Typography>
        <Alert severity="success" variant="outlined">
          {t('success')}
        </Alert>
        <Button label={t('back_to_login')} onClick={() => router.push('/auth/login')} />
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography component="h2" variant="h5">
        {t('title')}
      </Typography>
      <ForgotPasswordForm isPending={isPending} onSubmit={handleSubmit} />
    </Stack>
  );
}
