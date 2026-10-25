'use client';

import type { ResolvedPublicPortal } from '@contenster/shared';
import type { ReactNode } from 'react';

import { AppSnackbarProvider, GlobalProvider } from '@/core/providers/contexts';

import { MuiThemeProvider } from './MuiThemeProvider';

interface AuthProvidersProps {
  children: ReactNode;
  closeSnackbarLabel: string;
  portal: ResolvedPublicPortal;
}

export function AuthProviders({ children, closeSnackbarLabel, portal }: AuthProvidersProps) {
  return (
    <MuiThemeProvider portal={portal}>
      <AppSnackbarProvider closeSnackbarLabel={closeSnackbarLabel}>
        <GlobalProvider>{children}</GlobalProvider>
      </AppSnackbarProvider>
    </MuiThemeProvider>
  );
}
