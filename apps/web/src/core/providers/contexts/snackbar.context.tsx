'use client';

import { IconButton } from '@mui/material';
import { X } from 'lucide-react';
import { type OptionsObject, SnackbarProvider, useSnackbar } from 'notistack';
import { createContext, type ReactNode, useCallback, useContext, useMemo } from 'react';

interface AppSnackbarProviderProps {
  children: ReactNode;
  closeSnackbarLabel: string;
}

type ToastOptions = Pick<OptionsObject, 'action' | 'anchorOrigin'>;

const ToastOptionsContext = createContext<ToastOptions | null>(null);

interface ToastOptionsProviderProps {
  children: ReactNode;
  closeSnackbarLabel: string;
}

function ToastOptionsProvider({ children, closeSnackbarLabel }: ToastOptionsProviderProps) {
  const { closeSnackbar } = useSnackbar();

  const closeAction = useCallback(
    (snackbarId: string | number) => (
      <IconButton
        aria-label={closeSnackbarLabel}
        size="medium"
        title={closeSnackbarLabel}
        onClick={() => closeSnackbar(snackbarId)}
      >
        <X color="#fff" />
      </IconButton>
    ),
    [closeSnackbar, closeSnackbarLabel],
  );

  const toastOptions = useMemo<ToastOptions>(
    () => ({
      action: closeAction,
      anchorOrigin: {
        horizontal: 'right',
        vertical: 'bottom',
      },
    }),
    [closeAction],
  );

  return (
    <ToastOptionsContext.Provider value={toastOptions}>{children}</ToastOptionsContext.Provider>
  );
}

export function AppSnackbarProvider({ children, closeSnackbarLabel }: AppSnackbarProviderProps) {
  return (
    <SnackbarProvider maxSnack={3} preventDuplicate>
      <ToastOptionsProvider closeSnackbarLabel={closeSnackbarLabel}>
        {children}
      </ToastOptionsProvider>
    </SnackbarProvider>
  );
}

export function useToastOptions(): ToastOptions {
  const toastOptions = useContext(ToastOptionsContext);

  if (!toastOptions) {
    throw new Error('useToastOptions must be used within an AppSnackbarProvider.');
  }

  return toastOptions;
}
