'use client';

import type { ResolvedPublicPortal } from '@contenster/shared';
import type { ReactNode } from 'react';

import {
  AppSnackbarProvider,
  DatePickersProvider,
  GlobalProvider,
  ModalProvider,
} from '@/core/providers/contexts';
import type { Locale } from '@/i18n/routing';

import { MuiThemeProvider } from './MuiThemeProvider';

interface AdminProvidersProps {
  children: ReactNode;
  closeSnackbarLabel: string;
  locale: Locale;
  portal: ResolvedPublicPortal;
}

export function AdminProviders({
  children,
  closeSnackbarLabel,
  locale,
  portal,
}: AdminProvidersProps) {
  return (
    <MuiThemeProvider portal={portal}>
      <AppSnackbarProvider closeSnackbarLabel={closeSnackbarLabel}>
        <GlobalProvider>
          <DatePickersProvider locale={locale}>
            <ModalProvider>{children}</ModalProvider>
          </DatePickersProvider>
        </GlobalProvider>
      </AppSnackbarProvider>
    </MuiThemeProvider>
  );
}
