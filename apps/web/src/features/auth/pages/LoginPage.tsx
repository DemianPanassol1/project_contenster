'use client';

import type { AuthorizeResponse } from '@contenster/shared';
import { Stack, Typography } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { useToast, useWebResponseErrorToast } from '@/hooks';
import { useRouter } from '@/i18n/navigation';
import { authorize, signIn, signInGlobal } from '@/services/actions';

import { LoginForm } from '../components/LoginForm';
import type { LoginFormValues } from '../types/login.types';
import {
  getAutomaticClientId,
  toAuthorizeRequest,
  toSignInGlobalRequest,
  toSignInRequest,
} from '../utils/auth.utils';

export function LoginView() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('auth.login');
  const { errorMessage } = useToast();
  const showErrors = useWebResponseErrorToast();
  const [authorization, setAuthorization] = useState<AuthorizeResponse | null>(null);
  const [isPending, setIsPending] = useState(false);

  const signInClient = async (values: LoginFormValues, clientId: number): Promise<boolean> => {
    const response = await signIn(toSignInRequest(values, clientId), locale);

    if (!response.success) {
      showErrors(response);

      return false;
    }

    router.push('/admin');
    router.refresh();

    return true;
  };

  const submit = async (values: LoginFormValues): Promise<boolean> => {
    if (authorization) {
      if (values.clientId !== null) {
        return signInClient(values, values.clientId);
      }

      errorMessage(t('no_available_access'));

      return false;
    }

    const response = await authorize(toAuthorizeRequest(values), locale);

    if (!response.success || !response.body) {
      showErrors(response);

      return false;
    }

    const automaticClientId = getAutomaticClientId(response.body);

    if (automaticClientId !== null) {
      return signInClient(values, automaticClientId);
    }

    setAuthorization(response.body);

    return true;
  };

  const handleSubmit = async (values: LoginFormValues): Promise<boolean> => {
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

  const handleGlobalContextSignIn = async (values: LoginFormValues): Promise<void> => {
    setIsPending(true);

    try {
      const response = await signInGlobal(toSignInGlobalRequest(values), locale);

      if (!response.success) {
        showErrors(response);

        return;
      }

      router.push('/system-admin');
      router.refresh();
    } catch {
      errorMessage(t('unexpected_error'));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography component="h2" variant="h5">
        {t('title')}
      </Typography>
      <LoginForm
        authorization={authorization}
        isPending={isPending}
        onGlobalContextSignIn={handleGlobalContextSignIn}
        onSubmit={handleSubmit}
      />
    </Stack>
  );
}
