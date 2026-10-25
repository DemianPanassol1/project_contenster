'use client';

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
}

export function AdminProviders({ children, closeSnackbarLabel, locale }: AdminProvidersProps) {
  return (
    <MuiThemeProvider>
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
