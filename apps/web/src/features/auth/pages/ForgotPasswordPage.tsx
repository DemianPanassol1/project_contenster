'use client';

import type { ForgotPasswordRequest } from '@contenster/shared';
import { Alert, Stack } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { useToast, useWebResponseErrorToast } from '@/hooks';
import { useRouter } from '@/i18n/navigation';
import { AuthCard } from '@/layouts';
import { forgotPassword } from '@/services/actions';
import { Button } from '@/shared';

import { ForgotPasswordForm } from '../components/ForgotPasswordForm';

export function ForgotPasswordView() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('auth.password_recovery');
  const { errorMessage } = useToast();
  const showErrors = useWebResponseErrorToast();
  const [sent, setSent] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const submit = async (values: ForgotPasswordRequest): Promise<boolean> => {
    const response = await forgotPassword(values, locale);

    if (response.success) {
      setSent(true);

      return true;
    }

    showErrors(response);

    return false;
  };

  const handleSubmit = async (values: ForgotPasswordRequest): Promise<boolean> => {
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

  if (sent) {
    return (
      <AuthCard title={t('success_title')}>
        <Stack spacing={3}>
          <Alert severity="success" variant="outlined">
            {t('success')}
          </Alert>
          <Button label={t('back_to_login')} onClick={() => router.push('/auth/login')} />
        </Stack>
      </AuthCard>
    );
  }

  return (
    <AuthCard subtitle={t('subtitle')} title={t('title')}>
      <ForgotPasswordForm isPending={isPending} onSubmit={handleSubmit} />
    </AuthCard>
  );
}
