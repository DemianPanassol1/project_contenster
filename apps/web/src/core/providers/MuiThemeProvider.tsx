'use client';

import type { ResolvedPublicPortal } from '@contenster/shared';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { type ReactNode, useMemo } from 'react';

import {
  createPortalTheme,
  PORTAL_COLOR_SCHEME_STORAGE_KEY,
  PORTAL_MODE_STORAGE_KEY,
} from './portal-theme';

interface MuiThemeProviderProps {
  children: ReactNode;
  portal: ResolvedPublicPortal;
}

export function MuiThemeProvider({ children, portal }: MuiThemeProviderProps) {
  const theme = useMemo(() => createPortalTheme(portal), [portal]);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider
        colorSchemeStorageKey={PORTAL_COLOR_SCHEME_STORAGE_KEY}
        defaultMode="light"
        disableTransitionOnChange
        modeStorageKey={PORTAL_MODE_STORAGE_KEY}
        theme={theme}
      >
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
