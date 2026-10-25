'use client';

import type { ReactNode } from 'react';

import { AppSnackbarProvider } from '@/core/providers/contexts';

import { MuiThemeProvider } from './MuiThemeProvider';

interface AuthProvidersProps {
  children: ReactNode;
  closeSnackbarLabel: string;
}

export function AuthProviders({ children, closeSnackbarLabel }: AuthProvidersProps) {
  return (
    <MuiThemeProvider>
      <AppSnackbarProvider closeSnackbarLabel={closeSnackbarLabel}>{children}</AppSnackbarProvider>
    </MuiThemeProvider>
  );
}
