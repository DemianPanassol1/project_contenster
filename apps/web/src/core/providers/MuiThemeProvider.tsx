'use client';

import { CssBaseline, ThemeProvider } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import type { ReactNode } from 'react';

import { ADMIN_COLOR_SCHEME_STORAGE_KEY, ADMIN_MODE_STORAGE_KEY, adminTheme } from '@/core/theme';

interface MuiThemeProviderProps {
  children: ReactNode;
}

export function MuiThemeProvider({ children }: MuiThemeProviderProps) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider
        colorSchemeStorageKey={ADMIN_COLOR_SCHEME_STORAGE_KEY}
        defaultMode="system"
        disableTransitionOnChange
        modeStorageKey={ADMIN_MODE_STORAGE_KEY}
        theme={adminTheme}
      >
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
