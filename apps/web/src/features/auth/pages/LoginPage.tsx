'use client';

import type { AuthorizeResponse } from '@contenster/shared';
import { Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import { useToast } from '@/hooks';
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
  const t = useTranslations('auth.login');
  const { errorMessage } = useToast();
  const [authorization, setAuthorization] = useState<AuthorizeResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  const showErrors = (messages: string[]) => {
    messages.forEach(errorMessage);
  };

  const signInClient = async (values: LoginFormValues, clientId: number): Promise<boolean> => {
    const response = await signIn(toSignInRequest(values, clientId));

    if (!response.success) {
      showErrors(response.errors.map((error) => error.message));

      return false;
    }

    router.push('/admin');
    router.refresh();

    return true;
  };

  const submit = async (values: LoginFormValues): Promise<boolean> => {
    if (authorization) {
      return values.clientId === null ? false : signInClient(values, values.clientId);
    }

    const response = await authorize(toAuthorizeRequest(values));

    if (!response.success || !response.body) {
      showErrors(response.errors.map((error) => error.message));

      return false;
    }

    const automaticClientId = getAutomaticClientId(response.body);

    if (automaticClientId !== null) {
      return signInClient(values, automaticClientId);
    }

    setAuthorization(response.body);

    return true;
  };

  const handleSubmit = (values: LoginFormValues): Promise<boolean> =>
    new Promise((resolve) => {
      startTransition(() => {
        void submit(values).then(resolve);
      });
    });

  const handleGlobalContextSignIn = (values: LoginFormValues): Promise<void> =>
    new Promise((resolve) => {
      startTransition(() => {
        void (async () => {
          try {
            const response = await signInGlobal(toSignInGlobalRequest(values));

            if (!response.success) {
              showErrors(response.errors.map((error) => error.message));

              return;
            }

            router.push('/system-admin');
            router.refresh();
          } finally {
            resolve();
          }
        })();
      });
    });

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
